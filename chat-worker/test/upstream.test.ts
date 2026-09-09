import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildUpstreamPayload,
  buildUpstreamUrl,
  extractStreamError,
  extractStreamTextDelta,
  isStreamFinished,
  resolveUpstreamApi,
} from '../src/agent/upstream';

describe('OpenCode Zen upstream routing', () => {
  it('sends GPT 5.4 nano to the Responses API', () => {
    assert.equal(resolveUpstreamApi('gpt-5.4-nano'), 'responses');
    assert.equal(
      buildUpstreamUrl('https://opencode.ai/zen/v1', 'gpt-5.4-nano'),
      'https://opencode.ai/zen/v1/responses'
    );
  });

  it('strips the opencode/ prefix before routing', () => {
    assert.equal(resolveUpstreamApi('opencode/gpt-5.4-nano'), 'responses');
  });

  it('keeps chat/completions models on the OpenAI-compatible path', () => {
    assert.equal(resolveUpstreamApi('big-pickle'), 'chat_completions');
    assert.equal(resolveUpstreamApi('glm-5.3-flash'), 'chat_completions');
    assert.equal(
      buildUpstreamUrl('https://opencode.ai/zen/v1/', 'minimax-m2.7'),
      'https://opencode.ai/zen/v1/chat/completions'
    );
  });

  it('moves the system prompt to instructions for Responses requests', () => {
    const payload = buildUpstreamPayload('gpt-5.4-nano', [
      { role: 'system', content: 'You are Miguel\'s assistant.' },
      { role: 'user', content: 'What kind of engineer is Miguel?' },
    ]);

    assert.equal(payload.model, 'gpt-5.4-nano');
    assert.equal(payload.stream, true);
    assert.equal(payload.instructions, 'You are Miguel\'s assistant.');
    assert.deepEqual(payload.input, [
      { role: 'user', content: 'What kind of engineer is Miguel?' },
    ]);
    assert.equal('messages' in payload, false);
  });

  it('keeps messages on chat completions payloads', () => {
    const messages = [
      { role: 'system' as const, content: 'policy' },
      { role: 'user' as const, content: 'hello' },
    ];
    const payload = buildUpstreamPayload('big-pickle', messages);

    assert.deepEqual(payload.messages, messages);
    assert.equal('instructions' in payload, false);
  });
});

describe('upstream stream parsing', () => {
  it('reads Responses API text deltas', () => {
    assert.equal(
      extractStreamTextDelta({
        type: 'response.output_text.delta',
        delta: 'Hello',
      }),
      'Hello'
    );
    assert.equal(
      isStreamFinished({ type: 'response.completed' }),
      true
    );
  });

  it('still reads chat completions deltas', () => {
    assert.equal(
      extractStreamTextDelta({
        choices: [{ delta: { content: 'Hi' }, finish_reason: null }],
      }),
      'Hi'
    );
    assert.equal(
      isStreamFinished({
        choices: [{ delta: {}, finish_reason: 'stop' }],
      }),
      true
    );
  });

  it('surfaces Responses API stream errors', () => {
    assert.equal(
      extractStreamError({
        type: 'error',
        error: { type: 'AuthError', message: 'Invalid API key.' },
      }),
      'Invalid API key.'
    );
  });
});
