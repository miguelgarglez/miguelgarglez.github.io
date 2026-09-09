import type { ChatMessage } from './types';

export type UpstreamApi = 'responses' | 'chat_completions';

export function normalizeModelId(model: string) {
  return model.trim().replace(/^opencode\//i, '');
}

/**
 * OpenCode Zen routes GPT / Grok / Muse Spark through the OpenAI Responses
 * API. Chat Completions is only valid for the openai-compatible models
 * (GLM, Kimi, DeepSeek, MiniMax, Big Pickle, etc.).
 * See https://opencode.ai/docs/zen/
 */
export function resolveUpstreamApi(model: string): UpstreamApi {
  const id = normalizeModelId(model).toLowerCase();
  if (
    id.startsWith('gpt-') ||
    id.startsWith('grok-') ||
    id.startsWith('muse-spark-')
  ) {
    return 'responses';
  }
  return 'chat_completions';
}

export function buildUpstreamUrl(baseUrl: string, model: string) {
  const base = baseUrl.trim().replace(/\/+$/, '');
  return resolveUpstreamApi(model) === 'responses'
    ? `${base}/responses`
    : `${base}/chat/completions`;
}

export function buildUpstreamPayload(
  model: string,
  messages: ChatMessage[],
  stream = true
): Record<string, unknown> {
  const id = normalizeModelId(model);
  if (resolveUpstreamApi(model) === 'chat_completions') {
    return { model: id, stream, messages };
  }

  const instructions = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n');
  const input = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  return {
    model: id,
    stream,
    ...(instructions ? { instructions } : {}),
    input,
  };
}

export function extractStreamTextDelta(
  parsed: Record<string, unknown>
): string | null {
  if (
    parsed.type === 'response.output_text.delta' ||
    parsed.type === 'response.text.delta'
  ) {
    if (typeof parsed.delta === 'string' && parsed.delta.length > 0) {
      return parsed.delta;
    }
    const nested = parsed.delta;
    if (
      nested &&
      typeof nested === 'object' &&
      typeof (nested as { text?: unknown }).text === 'string'
    ) {
      const text = (nested as { text: string }).text;
      return text.length > 0 ? text : null;
    }
  }

  const choice = Array.isArray(parsed.choices)
    ? (parsed.choices[0] as Record<string, unknown> | undefined)
    : undefined;
  const delta = choice?.delta as Record<string, unknown> | undefined;
  const content = delta?.content;
  if (typeof content === 'string' && content.length > 0) {
    return content;
  }
  return null;
}

export function isStreamFinished(parsed: Record<string, unknown>): boolean {
  if (
    parsed.type === 'response.completed' ||
    parsed.type === 'response.incomplete'
  ) {
    return true;
  }
  const choice = Array.isArray(parsed.choices)
    ? (parsed.choices[0] as Record<string, unknown> | undefined)
    : undefined;
  const finishReason = choice?.finish_reason;
  return typeof finishReason === 'string' && finishReason.length > 0;
}

export function extractStreamError(
  parsed: Record<string, unknown>
): string | null {
  if (parsed.type !== 'response.failed' && parsed.type !== 'error') {
    return null;
  }
  const error = parsed.error;
  if (
    error &&
    typeof error === 'object' &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  if (typeof parsed.errorText === 'string') {
    return parsed.errorText;
  }
  return 'Upstream stream error.';
}
