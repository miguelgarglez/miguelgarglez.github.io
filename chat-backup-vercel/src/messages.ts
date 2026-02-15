export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function coerceContent(message: Record<string, unknown>) {
  if (typeof message.content === 'string') return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        if ((part as { type?: string }).type === 'text') {
          const text = (part as { text?: string }).text;
          return typeof text === 'string' ? text : '';
        }
        return '';
      })
      .join('');
  }
  return '';
}

export function extractMessages(body: Record<string, unknown>) {
  if (!Array.isArray(body.messages)) return [] as ChatMessage[];
  return body.messages
    .filter((message) => message && typeof message === 'object')
    .map((message) => {
      const record = message as Record<string, unknown>;
      const role = record.role;
      const content = coerceContent(record).trim();
      if (
        (role === 'user' || role === 'assistant' || role === 'system') &&
        content.length > 0
      ) {
        return { role, content };
      }
      return null;
    })
    .filter((message): message is ChatMessage => Boolean(message));
}

export function extractQuestion(body: Record<string, unknown>) {
  if (typeof body.question === 'string') return body.question.trim();

  if (Array.isArray(body.messages)) {
    const lastUser = [...body.messages]
      .reverse()
      .find((message) => {
        if (!message || typeof message !== 'object') return false;
        const asRecord = message as Record<string, unknown>;
        return asRecord.role === 'user' && typeof coerceContent(asRecord) === 'string';
      }) as Record<string, unknown> | undefined;

    if (lastUser) {
      const content = coerceContent(lastUser).trim();
      if (content.length > 0) return content;
    }
  }

  return '';
}

export function parseRequestBody(rawBody: unknown) {
  if (!rawBody) return null;

  if (typeof rawBody === 'string') {
    try {
      return JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  if (typeof rawBody === 'object') {
    return rawBody as Record<string, unknown>;
  }

  return null;
}
