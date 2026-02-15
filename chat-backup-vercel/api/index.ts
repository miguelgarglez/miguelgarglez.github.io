import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyHeaders, buildCorsHeaders, getAllowedOrigins, isOriginAllowed } from '../src/cors.js';

function getHeaderValue(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const allowedOrigins = getAllowedOrigins();
  const origin = getHeaderValue(req.headers.origin);
  const requestedHeaders = getHeaderValue(req.headers['access-control-request-headers']);
  const corsHeaders = buildCorsHeaders(origin, allowedOrigins, requestedHeaders);

  applyHeaders(res, corsHeaders);
  res.setHeader('X-Chat-Backend', 'vercel-fallback');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (!isOriginAllowed(origin, allowedOrigins)) {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  return res.status(200).json({
    service: 'chat-backup-vercel',
    backend: 'vercel-fallback',
    status: 'ok',
    endpoints: {
      health: '/healthz',
      chat: '/chat',
    },
  });
}
