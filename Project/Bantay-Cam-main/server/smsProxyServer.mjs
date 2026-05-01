import http from 'node:http';

const PORT = Number(process.env.SMS_PROXY_PORT || 8787);
const IPROG_API_TOKEN = process.env.IPROG_API_TOKEN;
const IPROG_SMS_PROVIDER = process.env.IPROG_SMS_PROVIDER;
const IPROG_API_BASE = process.env.IPROG_API_BASE || 'https://sms.iprogtech.com/api/v1';

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
};

const tryParseJson = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const normalizeUpstreamError = (payload, rawFallback, httpStatus, providerLabel) => {
  const candidates = [payload?.message, payload?.detail, payload?.error];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate.map((item) => String(item)).join('; ');
    }
  }
  return rawFallback || `${providerLabel} HTTP ${httpStatus}`;
};

const mapUpstreamStatusToProxyStatus = (upstreamHttpStatus, upstreamError) => {
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
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/sms/send') {
    if (!IPROG_API_TOKEN) {
      return sendJson(res, 500, {
        success: false,
        error: 'Server IPROG API token is not configured',
      });
    }

    try {
      const body = await parseBody(req);
      const to = typeof body.to === 'string' ? body.to.trim() : '';
      const messageBody = typeof body.body === 'string' ? body.body.trim() : '';

      if (!to || !messageBody) {
        return sendJson(res, 400, {
          success: false,
          error: 'Both "to" and "body" are required',
        });
      }

      const form = new URLSearchParams({
        api_token: IPROG_API_TOKEN,
        phone_number: to,
        message: messageBody,
      });

      if (IPROG_SMS_PROVIDER && IPROG_SMS_PROVIDER.trim()) {
        form.set('sms_provider', IPROG_SMS_PROVIDER.trim());
      }

      const providerResponse = await fetch(`${IPROG_API_BASE}/sms_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      });

      const providerRaw = await providerResponse.text();
      const providerPayload = tryParseJson(providerRaw);

      if (!providerResponse.ok) {
        const upstreamError = normalizeUpstreamError(
          providerPayload,
          providerRaw,
          providerResponse.status,
          'IPROG API'
        );
        return sendJson(res, mapUpstreamStatusToProxyStatus(providerResponse.status, upstreamError), {
          success: false,
          error: upstreamError,
        });
      }

      const messageId = providerPayload?.message_id || providerPayload?.data?.message_id;
      const statusCode = Number(providerPayload?.status);
      const isAccepted = statusCode === 200 || Boolean(messageId);

      if (!isAccepted) {
        const upstreamError =
          normalizeUpstreamError(
            providerPayload,
            providerRaw,
            providerResponse.status,
            'IPROG SMS API'
          ) || 'IPROG SMS API rejected message';

        return sendJson(res, mapUpstreamStatusToProxyStatus(providerResponse.status, upstreamError), {
          success: false,
          error: upstreamError,
        });
      }

      return sendJson(res, 200, {
        success: true,
        data: {
          message_id: messageId || 'queued',
          status: 'sent',
        },
      });
    } catch (err) {
      return sendJson(res, 500, {
        success: false,
        error: err instanceof Error ? err.message : 'Unexpected server error',
      });
    }
  }

  return sendJson(res, 404, {
    success: false,
    error: 'Not found',
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SMS proxy listening on port ${PORT}`);
});
