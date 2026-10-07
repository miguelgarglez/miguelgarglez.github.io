import {
  extractStreamError,
  extractStreamTextDelta,
  isStreamFinished,
} from './agent/upstream';

export type UiStreamEndInfo = { receivedBytes: number; errorSent: boolean };

export type UiMessageStreamOptions = {
  onEnd?: (info: UiStreamEndInfo) => void;
};

export function createUiMessageStream(
  upstream: ReadableStream<Uint8Array>,
  { onEnd }: UiMessageStreamOptions = {}
) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const messageId = `msg_${crypto.randomUUID()}`;
  let buffer = '';
  let started = false;
  let textStarted = false;
  let ended = false;
  let doneSent = false;
  let errorSent = false;
  let stopReading = false;
  let receivedBytes = 0;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  const emit = (payload: string) => encoder.encode(`data: ${payload}\n\n`);

  const emitJson = (payload: Record<string, unknown>) =>
    emit(JSON.stringify(payload));

  const ensureStarted = () => {
    if (started) return;
    started = true;
    textStarted = true;
    if (!controller) return;
    controller.enqueue(emitJson({ type: 'start', messageId }));
    controller.enqueue(emitJson({ type: 'text-start', id: messageId }));
  };

  const endMessage = () => {
    if (ended) return;
    if (!started) {
      ended = true;
      return;
    }
    ended = true;
    if (!controller) return;
    if (textStarted) {
      controller.enqueue(emitJson({ type: 'text-end', id: messageId }));
    }
    controller.enqueue(emitJson({ type: 'finish', finishReason: 'stop' }));
  };

  const sendDone = () => {
    if (doneSent) return;
    if (!controller) return;
    controller.enqueue(emit('[DONE]'));
    doneSent = true;
  };

  const sendError = (message: string) => {
    if (errorSent) return;
    errorSent = true;
    if (!controller) return;
    controller.enqueue(emitJson({ type: 'error', errorText: message }));
  };

  const handleData = (data: string) => {
    if (!data) return;
    if (data === '[DONE]') {
      endMessage();
      sendDone();
      stopReading = true;
      reader?.cancel().catch(() => undefined);
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
      reader?.cancel().catch(() => undefined);
      return;
    }

    const content = extractStreamTextDelta(parsed);
    if (content) {
      ensureStarted();
      if (controller) {
        controller.enqueue(
          emitJson({ type: 'text-delta', id: messageId, delta: content })
        );
      }
    }

    if (isStreamFinished(parsed)) {
      endMessage();
    }
  };

  const processBuffer = () => {
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    lines.forEach((rawLine) => {
      const line = rawLine.trimEnd();
      if (!line || line.startsWith(':')) return;
      if (!line.startsWith('data:')) return;
      const data = line.slice(5).trimStart();
      handleData(data);
    });
  };

  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

  return new ReadableStream<Uint8Array>({
    async start(streamController) {
      controller = streamController;
      reader = upstream.getReader();

      try {
        while (reader) {
          const { value, done } = await reader.read();
          if (done) break;
          if (stopReading) break;
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
          sendError(
            error instanceof Error ? error.message : 'Stream processing error.'
          );
        }
      } finally {
        if (receivedBytes === 0 && !errorSent) {
          sendError('No response from the model.');
        }
        endMessage();
        sendDone();
        controller.close();
        onEnd?.({ receivedBytes, errorSent });
      }
    },
    cancel() {
      if (reader) {
        reader.cancel().catch(() => undefined);
      }
    },
  });
}
