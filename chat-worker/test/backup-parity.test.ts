import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runProfileAgent as runWorker } from '../src/agent/run-profile-agent';
import { suggestedPromptContracts } from '../src/agent/suggested-prompts';
import { createUiMessageStream } from '../src/ui-stream';
import { runProfileAgent as runBackup } from '../../chat-backup-vercel/shared/profile-agent/agent/run-profile-agent';
import { suggestedPromptContracts as backupContracts } from '../../chat-backup-vercel/shared/profile-agent/agent/suggested-prompts';
import backupHandler from '../../chat-backup-vercel/api/chat';
import { findDrift } from '../../scripts/sync-backup-agent.mjs';

const ids = (items: { id: string }[]) => items.map((item) => item.id);

const questions = [
  ...suggestedPromptContracts.map((contract) => contract.prompt),
  'What has Miguel built outside work?',
  'que me cuentas de hackathones',
  'hackatones',
  'have you done hackathons?',
  '¿has hecho hackathons?',
  'tdots',
  'What happened at t·Dots?',
  'How can I contact Miguel?',
  '¿Cómo contacto con Miguel?',
  'Tell me about his experience at Santander',
  'What is his education?',
  '¿Qué formación académica tiene Miguel?',
  'What roles is Miguel a good fit for?',
];

describe('Vercel backup mirrors the Worker profile agent', () => {
  it('generated mirror matches the Worker sources (run node scripts/sync-backup-agent.mjs)', () => {
    assert.deepEqual(findDrift(process.cwd()), []);
  });

  it('has the same suggested-prompt contracts', () => {
    assert.deepEqual(backupContracts, suggestedPromptContracts);
  });

  for (const question of questions) {
    it(`same context, prompt and parts for "${question}"`, () => {
      const inboundMessages = [{ role: 'user' as const, content: question }];
      const worker = runWorker({ question, inboundMessages });
      const backup = runBackup({ question, inboundMessages });
      assert.equal(backup.context.intent, worker.context.intent);
      assert.equal(backup.context.audience, worker.context.audience);
      assert.deepEqual(ids(backup.context.selectedFacts), ids(worker.context.selectedFacts));
      assert.deepEqual(ids(backup.context.selectedProfileBlocks), ids(worker.context.selectedProfileBlocks));
      assert.deepEqual(ids(backup.context.selectedProjects), ids(worker.context.selectedProjects));
      assert.deepEqual(ids(backup.context.selectedMemories), ids(worker.context.selectedMemories));
      assert.equal(backup.messages[0].content, worker.messages[0].content);
      assert.deepEqual(backup.messages, worker.messages);
      assert.deepEqual(backup.parts, worker.parts);
    });
  }

  it('answers "built outside work" from real context on the backup', () => {
    const { context } = runBackup({ question: 'What has Miguel built outside work?', inboundMessages: [] });
    assert.ok(context.selectedProjects.length > 0);
  });
});

function upstreamStream() {
  const encoder = new TextEncoder();
  const events = [
    { choices: [{ delta: { content: 'Hola ' } }] },
    { choices: [{ delta: { content: 'Miguel' } }] },
    { choices: [{ delta: {}, finish_reason: 'stop' }] },
  ];
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

function parseEvents(text: string) {
  return text
    .split('\n\n')
    .filter(Boolean)
    .map((chunk) => chunk.replace(/^data: /, ''))
    .map((data) => (data === '[DONE]' ? { type: '[DONE]' } : JSON.parse(data)))
    .map((event) => {
      const { messageId: _m, id: _i, ...rest } = event as Record<string, unknown>;
      return rest;
    });
}

function mockResponse() {
  const chunks: string[] = [];
  const headers: Record<string, string> = {};
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    setHeader(key: string, value: string) {
      headers[key.toLowerCase()] = String(value);
      return res;
    },
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
    end() {
      return res;
    },
    write(chunk: Uint8Array | string) {
      chunks.push(typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk));
      return true;
    },
    flushHeaders() {},
  };
  return { res, chunks, headers };
}

describe('Vercel backup handler', () => {
  it('sends the Worker system prompt upstream and streams the Worker UI format', async () => {
    const question = 'que me cuentas de hackathones';
    const originalFetch = globalThis.fetch;
    const env = { ...process.env };
    let sentBody: { messages?: { role: string; content: string }[]; input?: unknown; model?: string } | null = null;
    let sentUrl = '';
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      sentUrl = String(url);
      sentBody = JSON.parse(String(init.body));
      return new Response(upstreamStream(), { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
    }) as typeof fetch;
    process.env.LLM_API_KEY = 'test-key';
    process.env.LLM_MODEL = 'gpt-5.4-nano';
    delete process.env.LLM_BASE_URL;

    try {
      const { res, chunks, headers } = mockResponse();
      await backupHandler(
        {
          method: 'POST',
          headers: {
            origin: 'https://miguelgarglez.com',
            'x-forwarded-for': '203.0.113.7',
            'x-chat-attempt': 'secondary',
            'x-chat-failover-reason': 'http:401',
          },
          body: { messages: [{ role: 'user', parts: [{ type: 'text', text: question }] }] },
        } as never,
        res as never
      );

      assert.equal(res.statusCode, 200, JSON.stringify(res.body));
      assert.equal(headers['x-vercel-ai-ui-message-stream'], 'v1');
      assert.equal(headers['x-chat-backend'], 'vercel-fallback');

      const expected = runWorker({ question, inboundMessages: [{ role: 'user', content: question }] });
      assert.ok(sentUrl.startsWith('https://opencode.ai/zen/v1'));
      const sent = JSON.stringify(sentBody);
      assert.ok(sent.includes(JSON.stringify(expected.messages[0].content)), 'payload carries the Worker system prompt');
      assert.match(sent, /banana-bank|t·Dots|Banana Bank/i);

      const workerText = await new Response(
        createUiMessageStream(upstreamStream(), { parts: expected.parts })
      ).text();
      assert.deepEqual(parseEvents(chunks.join('')), parseEvents(workerText));
    } finally {
      globalThis.fetch = originalFetch;
      process.env = env;
    }
  });
});
