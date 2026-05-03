import { errorService } from './errorService';
import { ErrorType, ErrorSeverity } from '../types';

/** Local Philippine mobile (09XXXXXXXXX) for SMS gateways; accepts +63… on input. */
export function normalizePhilippineMobileForSms(phone: string): string {
  const t = phone.trim();
  if (t.startsWith('+63')) return `0${t.slice(3)}`;
  return t;
}

interface SMSProxyResponse {
  success: boolean;
  data?: {
    message_id: string;
    status: string;
  };
  error?: string;
  details?: unknown;
}

class SMSProxyService {
  private static instance: SMSProxyService;

  private constructor() {}

  public static getInstance(): SMSProxyService {
    if (!SMSProxyService.instance) {
      SMSProxyService.instance = new SMSProxyService();
    }
    return SMSProxyService.instance;
  }

  async sendSMS(to: string, body: string): Promise<SMSProxyResponse> {
    const toLocal = normalizePhilippineMobileForSms(to);
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: toLocal, body }),
      });

      const rawBody = await response.text();
      let payload: SMSProxyResponse = {
        success: false,
        error: `HTTP ${response.status}`,
        details: rawBody ? rawBody.slice(0, 500) : undefined,
      };

      const contentType = response.headers.get('content-type') || '';
      const looksLikeHtmlFallback =
        contentType.includes('text/html') ||
        /^\s*<!doctype html/i.test(rawBody) ||
        /<html[^>]*>/i.test(rawBody);
      const looksLikeViteProxyFailure =
        (response.status === 500 &&
          (/econnrefused|proxy error|target server/i.test(rawBody) ||
            (!rawBody && !contentType.includes('application/json')))) ||
        looksLikeHtmlFallback;
      if (looksLikeViteProxyFailure) {
        payload = {
          success: false,
          error: looksLikeHtmlFallback
            ? 'SMS proxy is not being reached (received HTML). Start proxy with: npm run dev:proxy'
            : 'SMS proxy is not reachable. Start it with: npm run dev:proxy',
          details: rawBody ? rawBody.slice(0, 500) : undefined,
        };
      }

      if (rawBody && !looksLikeViteProxyFailure) {
        try {
          payload = JSON.parse(rawBody) as SMSProxyResponse;
        } catch {
          payload = {
            success: false,
            error: `Non-JSON response from SMS proxy (HTTP ${response.status})`,
            details: rawBody.slice(0, 500),
          };
        }
      }

      if (!response.ok || !payload.success) {
        const message =
          payload.error ||
          (rawBody ? `SMS proxy error (HTTP ${response.status})` : `HTTP ${response.status}`);
        throw new Error(message);
      }

      return payload;
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : 'Unknown error';
      const isProxyUnavailable =
        rawMessage === 'Failed to fetch' ||
        /networkerror|network error|econnrefused|failed to fetch/i.test(rawMessage);
      const message = isProxyUnavailable
        ? 'SMS proxy is not reachable. Start it with: npm run dev:proxy'
        : rawMessage;
      errorService.log({
        type: ErrorType.SYSTEM,
        severity: ErrorSeverity.HIGH,
        message: 'Failed to send SMS via backend proxy',
        actionRequired: 'Verify backend proxy and IPROG API token',
        context: { error: message, to: toLocal },
      });
      return {
        success: false,
        error: message,
      };
    }
  }
}

export const smsProxyService = SMSProxyService.getInstance();
