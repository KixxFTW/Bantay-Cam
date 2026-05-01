import http from 'node:http';

const PORT = Number(process.env.SMS_PROXY_PORT || 8787);
const CLICKSEND_USERNAME = process.env.CLICKSEND_USERNAME;
const CLICKSEND_API_KEY = process.env.CLICKSEND_API_KEY;
const CLICKSEND_API_URL = 'https://rest.clicksend.com/v3';

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
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
    if (!CLICKSEND_USERNAME || !CLICKSEND_API_KEY) {
      return sendJson(res, 500, {
        success: false,
        error: 'Server ClickSend credentials are not configured',
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

      const auth = Buffer.from(`${CLICKSEND_USERNAME}:${CLICKSEND_API_KEY}`).toString('base64');
      const clicksendResponse = await fetch(`${CLICKSEND_API_URL}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          messages: [
            {
              to,
              body: messageBody,
              from: 'BantayCam',
              custom_string: `bantay_${Date.now()}`,
            },
          ],
        }),
      });

      const clicksendPayload = await clicksendResponse.json();

      if (!clicksendResponse.ok) {
        const upstreamError =
          clicksendPayload?.response_msg ||
          clicksendPayload?.errors?.[0]?.error ||
          `ClickSend HTTP ${clicksendResponse.status}`;
        return sendJson(res, 502, {
          success: false,
          error: upstreamError,
        });
      }

      const message = clicksendPayload?.data?.messages?.[0];
      if (message?.status !== 'SUCCESS') {
        return sendJson(res, 502, {
          success: false,
          error: message?.error || 'ClickSend rejected message',
        });
      }

      return sendJson(res, 200, {
        success: true,
        data: {
          message_id: message.message_id,
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
