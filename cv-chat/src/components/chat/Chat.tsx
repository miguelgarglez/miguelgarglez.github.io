import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { ArrowUpRightIcon, CornerDownLeftIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { cn } from '@/lib/utils';
import { AgentActivity, looksSpanish } from './AgentActivity';
import { ContextTrace, type ContextTraceData } from './ContextTrace';

type ChatMessage = UIMessage<unknown, { context: ContextTraceData }>;

const STARTER_QUESTIONS = [
  { label: 'Profile', prompt: 'What kind of engineer is Miguel?' },
  { label: 'Practice', prompt: 'How does Miguel use AI in engineering?' },
  { label: 'Meta', prompt: 'How does this CV chat work?' },
];

const FOLLOW_UPS: Record<string, string[]> = {
  summary: ['What has Miguel built at Santander?', 'How does Miguel use AI in engineering?'],
  experience: ["Summarize Miguel's QA background", "How did Miguel's early role shape his product mindset?"],
  projects: ['How does this CV chat work?', 'What has Miguel built at Santander?'],
  skills: ["Explain Miguel's design system experience", 'What makes Miguel a strong product-minded frontend engineer?'],
  work_style: ['What kind of engineer is Miguel?', 'What has Miguel built at Santander?'],
  education: ['What has Miguel been learning recently?', 'What kind of engineer is Miguel?'],
  recent_updates: ['How does Miguel use AI in engineering?', 'What has Miguel built at Santander?'],
};

const DEFAULT_FOLLOW_UPS = [
  'What has Miguel built at Santander?',
  'How does Miguel use AI in engineering?',
  "Summarize Miguel's work style",
];

function getContextTrace(message: ChatMessage) {
  for (const part of message.parts) {
    if (part.type === 'data-context') return part.data;
  }
  return null;
}

function getMessageText(message: ChatMessage) {
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')
    .trim();
}

type ChatProps = {
  primaryApiUrl: string;
  secondaryApiUrl?: string;
  className?: string;
  autoFocus?: boolean;
  suggestedPrompt?: string;
};

type ChatErrorKind =
  | 'unavailable'
  | 'retryable'
  | 'timeout'
  | 'workerRateLimited'
  | 'providerRateLimited'
  | 'providerQuotaExceeded'
  | null;

type ChatApiErrorPayload = {
  error?: string;
  errorCode?: string;
  source?: string;
  retryAfterSeconds?: number | null;
};

const PRIMARY_DEGRADED_MS = 5 * 60 * 1000;
const PRIMARY_REQUEST_TIMEOUT_MS = 15_000;
const SECONDARY_REQUEST_TIMEOUT_MS = 12_000;
const FAILOVER_STATUSES = new Set([
  408,
  429,
  500,
  502,
  503,
  504,
  520,
  521,
  522,
  523,
  524,
  525,
  526,
  530,
]);

function cloneRequestInit(init?: RequestInit): RequestInit | undefined {
  if (!init) return undefined;
  if (init.body instanceof ReadableStream) {
    throw new Error('Streaming request body is not supported by chat failover.');
  }
  return {
    ...init,
    headers: init.headers ? new Headers(init.headers) : undefined,
  };
}

function fetchWithTimeout(
  url: string,
  init: RequestInit | undefined,
  timeoutMs: number
) {
  const timeoutController = new AbortController();
  const requestInit = cloneRequestInit(init) ?? {};
  const externalSignal = requestInit.signal;

  if (externalSignal) {
    if (externalSignal.aborted) {
      timeoutController.abort();
    } else {
      externalSignal.addEventListener(
        'abort',
        () => timeoutController.abort(),
        { once: true }
      );
    }
  }

  requestInit.signal = timeoutController.signal;

  const timeoutId = window.setTimeout(() => {
    timeoutController.abort();
  }, timeoutMs);

  return fetch(url, requestInit).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

export default function Chat({
  primaryApiUrl,
  secondaryApiUrl,
  className,
  autoFocus,
  suggestedPrompt,
}: ChatProps) {
  const [input, setInput] = useState('');
  const [lastSubmittedText, setLastSubmittedText] = useState('');
  const [chatError, setChatError] = useState<ChatErrorKind>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(
    null
  );
  const primaryDegradedUntilRef = useRef(0);
  const contactHint = (
    <span>
      If you need help right now, reach out on{' '}
      <a
        href="https://x.com/miguel_garglez"
        target="_blank"
        rel="noreferrer"
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        X
      </a>
      ,{' '}
      <a
        href="https://www.linkedin.com/in/miguel-garciag"
        target="_blank"
        rel="noreferrer"
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        LinkedIn
      </a>
      , or open{' '}
      <a
        href="#contact"
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        Contact
      </a>
      .
    </span>
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatMessage>({
        api: primaryApiUrl || secondaryApiUrl || '',
        headers: {
          'x-vercel-ai-ui-message-stream': 'v1',
        },
        fetch: async (_input, init) => {
          const chatRequestId = nanoid();
          let failoverReason: string | null = null;
          const applyErrorFromResponse = async (response: Response) => {
            let errorPayload: ChatApiErrorPayload | null = null;
            const contentType = response.headers.get('Content-Type');
            if (contentType?.includes('application/json')) {
              try {
                errorPayload =
                  (await response.clone().json()) as ChatApiErrorPayload;
              } catch {
                errorPayload = null;
              }
            }

            const retryAfterHeader = response.headers.get('Retry-After');
            const retryAfterFromHeader = retryAfterHeader
              ? Number(retryAfterHeader)
              : NaN;
            const parsedRetryAfter = Number.isFinite(
              errorPayload?.retryAfterSeconds
            )
              ? Number(errorPayload?.retryAfterSeconds)
              : Number.isFinite(retryAfterFromHeader)
                ? retryAfterFromHeader
                : null;
            setRetryAfterSeconds(parsedRetryAfter);

            if (response.status === 404 || response.status === 405) {
              setChatError('unavailable');
            } else if (response.status === 429) {
              if (errorPayload?.errorCode === 'UPSTREAM_RATE_LIMIT') {
                setChatError('providerRateLimited');
              } else if (errorPayload?.errorCode === 'WORKER_RATE_LIMIT') {
                setChatError('workerRateLimited');
              } else {
                setChatError('retryable');
              }
            } else if (response.status === 504) {
              setChatError('timeout');
            } else if (
              response.status === 503 &&
              errorPayload?.errorCode === 'UPSTREAM_QUOTA_EXCEEDED'
            ) {
              setChatError('providerQuotaExceeded');
            } else if (response.status === 429 || response.status >= 500) {
              setChatError('retryable');
            } else {
              setChatError('unavailable');
            }
          };

          try {
            const now = Date.now();
            const useSecondaryFirst =
              Boolean(secondaryApiUrl) &&
              now < primaryDegradedUntilRef.current;
            if (useSecondaryFirst) {
              failoverReason = 'primary-degraded';
            }
            const endpoints: Array<{
              url: string;
              kind: 'primary' | 'secondary';
            }> = [];

            if (useSecondaryFirst) {
              if (secondaryApiUrl) {
                endpoints.push({ url: secondaryApiUrl, kind: 'secondary' });
              }
            } else {
              if (primaryApiUrl) {
                endpoints.push({ url: primaryApiUrl, kind: 'primary' });
              }
              if (secondaryApiUrl) {
                endpoints.push({ url: secondaryApiUrl, kind: 'secondary' });
              }
            }

            if (endpoints.length === 0) {
              setChatError('unavailable');
              setRetryAfterSeconds(null);
              return new Response(
                JSON.stringify({ error: 'Chat endpoint not configured.' }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            }

            let response: Response | null = null;
            let lastNetworkError: unknown = null;

            for (let index = 0; index < endpoints.length; index += 1) {
              const endpoint = endpoints[index];
              const attemptInit = cloneRequestInit(init) ?? {};
              const attemptHeaders = new Headers(attemptInit.headers);
              attemptHeaders.set('x-chat-request-id', chatRequestId);
              attemptHeaders.set('x-chat-attempt', endpoint.kind);
              if (endpoint.kind === 'secondary' && failoverReason) {
                attemptHeaders.set('x-chat-failover-reason', failoverReason);
              }
              attemptInit.headers = attemptHeaders;
              try {
                response = await fetchWithTimeout(
                  endpoint.url,
                  attemptInit,
                  endpoint.kind === 'primary'
                    ? PRIMARY_REQUEST_TIMEOUT_MS
                    : SECONDARY_REQUEST_TIMEOUT_MS
                );
              } catch (error) {
                lastNetworkError = error;
                if (
                  endpoint.kind === 'primary' &&
                  secondaryApiUrl &&
                  index < endpoints.length - 1
                ) {
                  failoverReason =
                    error instanceof Error && error.name === 'AbortError'
                      ? 'timeout'
                      : 'network';
                  primaryDegradedUntilRef.current = Date.now() + PRIMARY_DEGRADED_MS;
                  continue;
                }
                throw error;
              }

              if (endpoint.kind === 'primary' && response.ok) {
                primaryDegradedUntilRef.current = 0;
              }

              const canFailover =
                endpoint.kind === 'primary' &&
                secondaryApiUrl &&
                index < endpoints.length - 1;

              if (canFailover && FAILOVER_STATUSES.has(response.status)) {
                failoverReason = `status:${response.status}`;
                primaryDegradedUntilRef.current = Date.now() + PRIMARY_DEGRADED_MS;
                continue;
              }

              break;
            }

            if (!response) {
              throw (
                lastNetworkError ??
                new Error('All chat backends failed before receiving a response.')
              );
            }

            if (!response.ok) {
              await applyErrorFromResponse(response);
            } else {
              setChatError(null);
              setRetryAfterSeconds(null);
            }

            return response;
          } catch (error) {
            setChatError('retryable');
            setRetryAfterSeconds(null);
            throw error;
          }
        },
      }),
    [primaryApiUrl, secondaryApiUrl]
  );

  const { messages, sendMessage, status, regenerate, clearError } = useChat<ChatMessage>({
    transport,
    onError: () => {
      setChatError((previous) => previous ?? 'retryable');
    },
  });
  const isBusy = status === 'submitted' || status === 'streaming';
  const submitStatus = isBusy ? status : 'ready';
  const canRetry =
    Boolean(chatError) &&
    (messages.length > 0 || lastSubmittedText.trim().length > 0);
  const lastMessage = messages.at(-1);
  const askedQuestions = new Set(
    messages
      .filter((message) => message.role === 'user')
      .map((message) => getMessageText(message).toLowerCase())
  );
  const lastTrace = lastMessage?.role === 'assistant' ? getContextTrace(lastMessage) : null;
  const followUps =
    status === 'ready' && !chatError && lastMessage?.role === 'assistant'
      ? (FOLLOW_UPS[lastTrace?.intent ?? ''] ?? DEFAULT_FOLLOW_UPS)
          .filter((prompt) => !askedQuestions.has(prompt.toLowerCase()))
          .slice(0, 2)
      : [];

  useEffect(() => {
    const prompt = suggestedPrompt?.trim();
    if (!prompt) return;
    setInput(prompt);
  }, [suggestedPrompt]);

  const handleSubmit = (message: PromptInputMessage) => {
    const trimmed = message.text?.trim();
    if (!trimmed || isBusy) return;
    setChatError(null);
    setRetryAfterSeconds(null);
    setLastSubmittedText(trimmed);
    sendMessage({ text: trimmed });
    setInput('');
  };

  const sendPrompt = (prompt: string) => {
    handleSubmit({ text: prompt, files: [] });
  };

  const handleRetry = () => {
    if (isBusy || !canRetry) return;

    const prompt = lastSubmittedText.trim();
    setChatError(null);
    setRetryAfterSeconds(null);
    clearError();

    if (messages.length > 0) {
      void regenerate();
      return;
    }

    if (!prompt) return;
    setInput('');
    void sendMessage({ text: prompt });
  };

  const renderErrorActions = () => (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {canRetry ? (
        <button
          type="button"
          onClick={handleRetry}
          disabled={isBusy}
          className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] border border-destructive/50 bg-background px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50"
        >
          Retry
        </button>
      ) : null}
      {chatError === 'unavailable' || chatError === 'providerQuotaExceeded' ? (
        <a
          href="#contact"
          className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-md)] border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
        >
          Contact
        </a>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-hidden bg-card lg:rounded-[var(--radius-lg)] lg:border lg:border-border lg:shadow-[var(--shadow-card)]',
        className
      )}
    >
      <Conversation className="flex-1">
        <ConversationContent className="pb-6">
          {messages.length === 0 ? (
            <ConversationEmptyState className="items-stretch justify-start gap-6 px-1 pt-6 text-left sm:justify-center sm:pt-4">
              <div className="space-y-3">
                <p className="chat-mono text-[0.68rem] uppercase tracking-[0.14em] text-[color:var(--primary)]">
                  /ask
                </p>
                <h3 className="text-[1.9rem] font-medium leading-[1.02] tracking-[-0.04em] text-foreground sm:text-[2.2rem]">
                  Ask anything about
                  <br />
                  Miguel&apos;s work.
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Answers come from curated CV data. Every reply shows the
                  context it was grounded in.
                </p>
              </div>
              <ol className="grid gap-2">
                {STARTER_QUESTIONS.map((question, index) => (
                  <li key={question.prompt}>
                    <button
                      type="button"
                      className="group flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background/60 px-3.5 py-2.5 text-left text-sm text-foreground transition-[border-color,background-color,transform] duration-200 hover:border-[color:var(--primary)] hover:bg-background active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
                      onClick={() => sendPrompt(question.prompt)}
                      disabled={isBusy}
                    >
                      <span className="chat-mono w-5 text-[0.68rem] text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1">{question.prompt}</span>
                      <span className="chat-mono hidden text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground sm:inline">
                        {question.label}
                      </span>
                      <ArrowUpRightIcon
                        className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--primary)]"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ol>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, index) =>
                    part.type === 'text' ? (
                      <MessageResponse key={`${message.id}-${index}`}>
                        {part.text}
                      </MessageResponse>
                    ) : null
                  )}
                  {message.role === 'assistant' ? (
                    <MessageTrace message={message} />
                  ) : null}
                </MessageContent>
              </Message>
            ))
          )}
          {followUps.length > 0 ? (
            <div className="chat-followup -mt-2 flex flex-wrap gap-2" aria-label="Suggested follow-up questions">
              {followUps.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-[color:var(--primary)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
                  onClick={() => sendPrompt(prompt)}
                >
                  <CornerDownLeftIcon className="size-3 text-[color:var(--primary)]" aria-hidden="true" />
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
          {chatError === 'retryable' && (
            <div className="mt-2 w-fit max-w-full rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p>
                Something went wrong while contacting the chat provider. Please
                try again. {contactHint}
              </p>
              {renderErrorActions()}
            </div>
          )}
          {chatError === 'providerRateLimited' && (
            <div className="mt-2 w-fit max-w-full rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p>
                The chat provider is rate-limited right now.
                {retryAfterSeconds !== null
                  ? ` Please retry in about ${Math.max(1, Math.ceil(retryAfterSeconds))} seconds.`
                  : ' Please retry in a moment.'}{' '}
                {contactHint}
              </p>
              {renderErrorActions()}
            </div>
          )}
          {chatError === 'workerRateLimited' && (
            <div className="mt-2 w-fit max-w-full rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p>
                Too many messages in a short time.
                {retryAfterSeconds !== null
                  ? ` Please retry in about ${Math.max(1, Math.ceil(retryAfterSeconds))} seconds.`
                  : ' Please wait a moment and try again.'}{' '}
                {contactHint}
              </p>
              {renderErrorActions()}
            </div>
          )}
          {chatError === 'providerQuotaExceeded' && (
            <div className="mt-2 w-fit max-w-full rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p>
                The chat provider quota is currently exhausted. Please try again
                later. {contactHint}
              </p>
              {renderErrorActions()}
            </div>
          )}
          {chatError === 'timeout' && (
            <div className="mt-2 w-fit max-w-full rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p>
                The chat provider is taking too long to respond. Please try
                again. {contactHint}
              </p>
              {renderErrorActions()}
            </div>
          )}
          {chatError === 'unavailable' && (
            <div className="mt-2 w-fit max-w-full rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p>The chat is currently unavailable. {contactHint}</p>
              {renderErrorActions()}
            </div>
          )}
          {status === 'submitted' && (
            <AgentActivity
              language={looksSpanish(lastSubmittedText) ? 'es' : 'en'}
            />
          )}
        </ConversationContent>
        <ConversationScrollButton className="border-border bg-card text-foreground hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)]" />
      </Conversation>

      <div className="border-t border-border bg-background px-4 pb-3 pt-4">
        <PromptInput className="w-full" onSubmit={handleSubmit}>
          <PromptInputTextarea
            className="min-h-13 pr-13 pb-2.5 pt-2.5"
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Type your question..."
            autoFocus={autoFocus}
            disabled={isBusy}
          />
          <PromptInputSubmit
            className="absolute bottom-2.5 right-2.5"
            status={submitStatus}
            disabled={isBusy || input.trim().length === 0}
          />
        </PromptInput>
        <p className="chat-mono mt-2 hidden items-center justify-between text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground sm:flex">
          <span>Grounded in curated CV data</span>
          <span>Enter to send · Shift+Enter for a new line</span>
        </p>
      </div>
    </div>
  );
}

function MessageTrace({ message }: { message: ChatMessage }) {
  const trace = getContextTrace(message);
  return trace ? <ContextTrace trace={trace} /> : null;
}
