import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

async function main() {
  let esbuild;
  try {
    esbuild = await import('esbuild');
  } catch {
    throw new Error(
      'esbuild is required to run profile-agent tests, but it is not available in local node_modules. Run an existing project install first; this script will not install packages.'
    );
  }

  const tempDir = await mkdtemp(join(tmpdir(), 'profile-agent-test-'));

  try {
    await esbuild.build({
      entryPoints: [
        'chat-worker/test/profile-agent.test.ts',
        'chat-worker/test/upstream.test.ts',
      ],
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node22',
      outdir: tempDir,
      outbase: 'chat-worker/test',
      external: ['node:assert/strict', 'node:test'],
      logLevel: 'silent',
    });

    await new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        ['--test', join(tempDir, 'profile-agent.test.js'), join(tempDir, 'upstream.test.js')],
        {
          stdio: 'inherit',
        }
      );
      child.on('error', reject);
      child.on('exit', (code) => {
        if (code === 0) resolve(undefined);
        else reject(new Error(`Profile agent tests failed with exit code ${code}`));
      });
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
