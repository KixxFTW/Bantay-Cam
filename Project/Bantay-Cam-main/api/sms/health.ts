import type { VercelRequest, VercelResponse } from '@vercel/node';

function json(res: VercelResponse, status: number, payload: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return json(res, 405, { success: false, error: 'Method not allowed' });
  }

  const token = process.env.IPROG_API_TOKEN;
  const apiBase = process.env.IPROG_API_BASE || 'https://sms.iprogtech.com/api/v1';
  const provider = process.env.IPROG_SMS_PROVIDER || null;

  const ok = Boolean(token && token.trim());
  return json(res, ok ? 200 : 500, {
    success: ok,
    error: ok ? undefined : 'Server IPROG API token is not configured',
    data: { provider, apiBase },
  });
}

