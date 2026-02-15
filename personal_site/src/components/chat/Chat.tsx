import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageSquareIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { Loader } from '@/components/ai-elements/loader';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { cn } from '@/lib/utils';

type ChatProps = {
  apiUrl: string;
  className?: string;
  autoFocus?: boolean;
};

type ChatErrorKind =
  | 'unavailable'
  | 'retryable'
  | 'timeout'
  | 'workerRateLimited'
  | 'openrouterRateLimited'
  | 'openrouterQuotaExceeded'
  | null;

type ChatApiErrorPayload = {
  error?: string;
  errorCode?: string;
  source?: string;
  retryAfterSeconds?: number | null;
};

export default function Chat({ apiUrl, className, autoFocus }: ChatProps) {
  const [input, setInput] = useState('');
  const [chatError, setChatError] = useState<ChatErrorKind>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(
    null
  );
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
      </a>{' '}
      or{' '}
      <a
        href="https://www.linkedin.com/in/miguel-garciag"
        target="_blank"
        rel="noreferrer"
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        LinkedIn
      </a>
      .
    </span>
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: apiUrl,
        headers: {
          'x-vercel-ai-ui-message-stream': 'v1',
        },
        fetch: async (input, init) => {
          try {
            const response = await fetch(input, init);
            if (!response.ok) {
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
                if (errorPayload?.errorCode === 'OPENROUTER_RATE_LIMIT') {
                  setChatError('openrouterRateLimited');
                } else if (errorPayload?.errorCode === 'WORKER_RATE_LIMIT') {
                  setChatError('workerRateLimited');
                } else {
                  setChatError('retryable');
                }
              } else if (response.status === 504) {
                setChatError('timeout');
              } else if (
                response.status === 503 &&
                errorPayload?.errorCode === 'OPENROUTER_QUOTA_EXCEEDED'
              ) {
                setChatError('openrouterQuotaExceeded');
              } else if (response.status === 429 || response.status >= 500) {
                setChatError('retryable');
              } else {
                setChatError('unavailable');
              }
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
    [apiUrl]
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onError: () => {
      setChatError((previous) => previous ?? 'retryable');
    },
  });
  const isBusy = status === 'submitted' || status === 'streaming';
  const submitStatus = isBusy ? status : 'ready';

  const handleSubmit = (message: PromptInputMessage) => {
    const trimmed = message.text?.trim();
    if (!trimmed || isBusy) return;
    setChatError(null);
    sendMessage({ text: trimmed });
    setInput('');
  };

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-hidden bg-card lg:h-[560px] lg:rounded-[var(--radius-lg)] lg:border lg:border-border lg:shadow-[var(--shadow-card)]',
        className
      )}
    >
      <Conversation className="flex-1">
        <ConversationContent className="pb-6">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquareIcon className="size-8" />}
              title="Start the conversation"
              description="Ask about Miguel's experience, projects, or background."
            />
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
                </MessageContent>
              </Message>
            ))
          )}
          {chatError === 'retryable' && (
            <div className="mt-2 w-fit rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Something went wrong while contacting the chat provider. Please
              try again. {contactHint}
            </div>
          )}
          {chatError === 'openrouterRateLimited' && (
            <div className="mt-2 w-fit rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              The chat provider is rate-limited right now.
              {retryAfterSeconds !== null
                ? ` Please retry in about ${Math.max(1, Math.ceil(retryAfterSeconds))} seconds.`
                : ' Please retry in a moment.'}{' '}
              {contactHint}
            </div>
          )}
          {chatError === 'workerRateLimited' && (
            <div className="mt-2 w-fit rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Too many messages in a short time.
              {retryAfterSeconds !== null
                ? ` Please retry in about ${Math.max(1, Math.ceil(retryAfterSeconds))} seconds.`
                : ' Please wait a moment and try again.'}{' '}
              {contactHint}
            </div>
          )}
          {chatError === 'openrouterQuotaExceeded' && (
            <div className="mt-2 w-fit rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              The chat provider quota is currently exhausted. Please try again
              later. {contactHint}
            </div>
          )}
          {chatError === 'timeout' && (
            <div className="mt-2 w-fit rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              The chat provider is taking too long to respond. Please try
              again. {contactHint}
            </div>
          )}
          {chatError === 'unavailable' && (
            <div className="mt-2 w-fit rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              The chat is currently unavailable. {contactHint}
            </div>
          )}
          {status === 'submitted' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="size-4" />
              Thinking...
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton className="border-border bg-card text-foreground hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)]" />
      </Conversation>

      <div className="border-t border-border bg-background p-4">
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
      </div>
    </div>
  );
}
