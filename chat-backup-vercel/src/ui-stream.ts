import type { VercelResponse } from '@vercel/node';
import {
  extractStreamError,
  extractStreamTextDelta,
  isStreamFinished,
} from './upstream.js';

function writeSse(res: VercelResponse, payload: string) {
  res.write(`data: ${payload}\n\n`);
}

function writeSseJson(res: VercelResponse, payload: Record<string, unknown>) {
  writeSse(res, JSON.stringify(payload));
}

export async function pipeOpenAiSseToUiMessageStream(
  upstream: ReadableStream<Uint8Array>,
  res: VercelResponse,
  onEnd?: (info: { receivedBytes: number; errorSent: boolean }) => void
) {
  const decoder = new TextDecoder();
  const messageId = `msg_${crypto.randomUUID()}`;
  const reader = upstream.getReader();

  let buffer = '';
  let started = false;
  let textStarted = false;
  let ended = false;
  let doneSent = false;
  let errorSent = false;
  let stopReading = false;
  let receivedBytes = 0;

  const ensureStarted = () => {
    if (started) return;
    started = true;
    textStarted = true;
    writeSseJson(res, { type: 'start', messageId });
    writeSseJson(res, { type: 'text-start', id: messageId });
  };

  const endMessage = () => {
    if (ended) return;
    if (!started) {
      ended = true;
      return;
    }

    ended = true;
    if (textStarted) {
      writeSseJson(res, { type: 'text-end', id: messageId });
    }
    writeSseJson(res, { type: 'finish', finishReason: 'stop' });
  };

  const sendDone = () => {
    if (doneSent) return;
    writeSse(res, '[DONE]');
    doneSent = true;
  };

  const sendError = (message: string) => {
    if (errorSent) return;
    errorSent = true;
    writeSseJson(res, { type: 'error', errorText: message });
  };

  const handleData = (data: string) => {
    if (!data) return;

    if (data === '[DONE]') {
      endMessage();
      sendDone();
      stopReading = true;
      void reader.cancel();
      return;
    }

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(data) as Record<string, unknown>;
    } catch {
      return;
    }

    const streamError = extractStreamError(parsed);
    if (streamError) {
      sendError(streamError);
      endMessage();
      sendDone();
      stopReading = true;
      void reader.cancel();
      return;
    }

    const content = extractStreamTextDelta(parsed);
    if (content) {
      ensureStarted();
      writeSseJson(res, { type: 'text-delta', id: messageId, delta: content });
    }

    if (isStreamFinished(parsed)) {
      endMessage();
    }
  };

  const processBuffer = () => {
    const normalized = buffer.replace(/\r\n/g, '\n');
    const lines = normalized.split('\n');
    buffer = lines.pop() ?? '';

    lines.forEach((rawLine) => {
      const line = rawLine.trimEnd();
      if (!line || line.startsWith(':')) return;
      if (!line.startsWith('data:')) return;
      const data = line.slice(5).trimStart();
      handleData(data);
    });
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done || stopReading) break;
      if (value) {
        receivedBytes += value.length;
      }
      buffer += decoder.decode(value, { stream: true });
      processBuffer();
    }

    buffer += decoder.decode();
    processBuffer();
  } catch (error) {
    if (!ended) {
      sendError(error instanceof Error ? error.message : 'Stream processing error.');
    }
  } finally {
    if (receivedBytes === 0 && !errorSent) {
      sendError('No response from the model.');
    }
    endMessage();
    sendDone();
    res.end();
    onEnd?.({ receivedBytes, errorSent });
  }
}
