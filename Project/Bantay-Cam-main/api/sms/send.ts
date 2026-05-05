import type { VercelRequest, VercelResponse } from '@vercel/node';

function json(res: VercelResponse, status: number, payload: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function normalizeUpstreamError(
  payload: any,
  rawFallback: string,
  httpStatus: number,
  providerLabel: string
): string {
  const candidates = [payload?.message, payload?.detail, payload?.error];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (Array.isArray(candidate) && candidate.length > 0) return candidate.map(String).join('; ');
  }
  return rawFallback || `${providerLabel} HTTP ${httpStatus}`;
}

function mapUpstreamStatusToProxyStatus(upstreamHttpStatus: number, upstreamError: unknown): number {
  if (upstreamHttpStatus >= 400 && upstreamHttpStatus < 500) return 400;
  const message = typeof upstreamError === 'string' ? upstreamError.toLowerCase() : '';
  const looksLikeValidationOrPolicy =
    message.includes('sender name') ||
    message.includes('smart/tnt') ||
    message.includes('invalid phone') ||
    message.includes('invalid format') ||
    message.includes('validation');
  if (looksLikeValidationOrPolicy) return 400;
  if (message.includes('invalid token') || message.includes('unauthorized')) return 401;
  return 502;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { success: false, error: 'Method not allowed' });
  }

  const token = process.env.IPROG_API_TOKEN;
  const provider = process.env.IPROG_SMS_PROVIDER;
  const apiBase = process.env.IPROG_API_BASE || 'https://sms.iprogtech.com/api/v1';

  if (!token || !token.trim()) {
    return json(res, 500, { success: false, error: 'Server IPROG API token is not configured' });
  }

  try {
    const to = typeof req.body?.to === 'string' ? req.body.to.trim() : '';
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';

    if (!to || !body) {
      return json(res, 400, { success: false, error: 'Both "to" and "body" are required' });
    }

    const form = new URLSearchParams({
      api_token: token.trim(),
      phone_number: to,
      message: body,
    });
    if (provider && provider.trim()) form.set('sms_provider', provider.trim());

    const upstream = await fetch(`${apiBase}/sms_messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    const upstreamRaw = await upstream.text();
    let upstreamPayload: any = null;
    try {
      upstreamPayload = upstreamRaw ? JSON.parse(upstreamRaw) : null;
    } catch {
      upstreamPayload = null;
    }

    if (!upstream.ok) {
      const upstreamError = normalizeUpstreamError(
        upstreamPayload,
        upstreamRaw,
        upstream.status,
        'IPROG API'
      );
      return json(res, mapUpstreamStatusToProxyStatus(upstream.status, upstreamError), {
        success: false,
        error: upstreamError,
      });
    }

    const messageId = upstreamPayload?.message_id || upstreamPayload?.data?.message_id;
    const statusCode = Number(upstreamPayload?.status);
    const isAccepted = statusCode === 200 || Boolean(messageId);

    if (!isAccepted) {
      const upstreamError =
        normalizeUpstreamError(upstreamPayload, upstreamRaw, upstream.status, 'IPROG SMS API') ||
        'IPROG SMS API rejected message';
      return json(res, mapUpstreamStatusToProxyStatus(upstream.status, upstreamError), {
        success: false,
        error: upstreamError,
      });
    }

    return json(res, 200, {
      success: true,
      data: {
        message_id: messageId || 'queued',
        status: 'sent',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error';
    return json(res, 500, { success: false, error: message });
  }
}

