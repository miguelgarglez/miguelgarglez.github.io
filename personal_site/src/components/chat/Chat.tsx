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

type ChatProps = {
  apiUrl: string;
};

export default function Chat({ apiUrl }: ChatProps) {
  const [input, setInput] = useState('');

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: apiUrl,
        headers: {
          'x-vercel-ai-ui-message-stream': 'v1',
        },
      }),
    [apiUrl]
  );

  const { messages, sendMessage, status } = useChat({ transport });
  const isBusy = status === 'submitted' || status === 'streaming';
  const submitStatus = isBusy ? status : 'ready';

  const handleSubmit = (message: PromptInputMessage) => {
    const trimmed = message.text?.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput('');
  };

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)]">
      <Conversation className="flex-1">
        <ConversationContent className="h-full">
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
          {status === 'submitted' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="size-4" />
              Thinking...
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background p-4">
        <PromptInput className="w-full" onSubmit={handleSubmit}>
          <PromptInputTextarea
            className="min-h-13 pr-13 pb-2.5 pt-2.5"
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Type your question..."
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
