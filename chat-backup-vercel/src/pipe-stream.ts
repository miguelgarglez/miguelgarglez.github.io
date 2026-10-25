import type { VercelResponse } from '@vercel/node';

// Writes a Web ReadableStream (the Worker's UI message stream) to a Node response.
export async function pipeWebStreamToResponse(
  stream: ReadableStream<Uint8Array>,
  res: VercelResponse
) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) res.write(value);
    }
  } finally {
    reader.releaseLock();
    res.end();
  }
}
