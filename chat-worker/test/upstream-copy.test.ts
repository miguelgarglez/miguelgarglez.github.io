import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const repoRoot = process.cwd();

function upstreamBody(path: string) {
  const source = readFileSync(path, 'utf8');
  const marker = 'export type UpstreamApi';
  const index = source.indexOf(marker);
  assert.notEqual(index, -1, `marker not found in ${path}`);
  return source.slice(index);
}

describe('upstream.ts copies stay in sync', () => {
  it('chat-backup-vercel/src/upstream.ts body matches the Worker copy', () => {
    const worker = upstreamBody(
      join(repoRoot, 'chat-worker/src/agent/upstream.ts')
    );
    const fallback = upstreamBody(
      join(repoRoot, 'chat-backup-vercel/src/upstream.ts')
    );
    assert.equal(fallback, worker);
  });
});
