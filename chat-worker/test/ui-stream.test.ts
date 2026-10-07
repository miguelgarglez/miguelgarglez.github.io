import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUiMessageStream } from '../src/ui-stream';

type UiEvent = { type: string; [key: string]: unknown };

function upstreamOf(events: Record<string, unknown>[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      controller.close();
    },
  });
}

async function readEvents(stream: ReadableStream<Uint8Array>) {
  const text = await new Response(stream).text();
  return text
    .split('\n\n')
    .filter(Boolean)
    .map((chunk) => chunk.replace(/^data: /, ''))
    .map((data): UiEvent =>
      data === '[DONE]' ? { type: '[DONE]' } : (JSON.parse(data) as UiEvent)
    );
}

const delta = (text: string) => ({
  type: 'response.output_text.delta',
  delta: text,
});

describe('createUiMessageStream', () => {
  it('wraps streamed text in a single assistant message', async () => {
    const events = await readEvents(
      createUiMessageStream(
        upstreamOf([delta('Hello'), delta(' there'), { type: 'response.completed' }])
      )
    );

    assert.deepEqual(
      events.map((event) => event.type),
      ['start', 'text-start', 'text-delta', 'text-delta', 'text-end', 'finish', '[DONE]'],
      'text stream event order'
    );
    assert.equal(
      events
        .filter((event) => event.type === 'text-delta')
        .map((event) => event.delta)
        .join(''),
      'Hello there',
      'deltas carry the upstream text'
    );
  });

  it('sends only an error when the upstream sends no bytes', async () => {
    let endInfo: { receivedBytes: number; errorSent: boolean } | null = null;
    const events = await readEvents(
      createUiMessageStream(upstreamOf([]), {
        onEnd: (info) => {
          endInfo = info;
        },
      })
    );

    assert.deepEqual(
      events.map((event) => event.type),
      ['error', '[DONE]'],
      'no start means no empty assistant message'
    );
    assert.equal(events[0].errorText, 'No response from the model.');
    assert.deepEqual(endInfo, { receivedBytes: 0, errorSent: true });
  });

  it('reports an upstream error after text has started', async () => {
    const events = await readEvents(
      createUiMessageStream(
        upstreamOf([
          delta('Partial'),
          { type: 'response.failed', error: { message: 'boom' } },
          delta('ignored'),
        ])
      )
    );

    assert.deepEqual(
      events.map((event) => event.type),
      ['start', 'text-start', 'text-delta', 'error', 'text-end', 'finish', '[DONE]'],
      'error closes the started message'
    );
    assert.equal(events.find((event) => event.type === 'error')?.errorText, 'boom');
  });
});
