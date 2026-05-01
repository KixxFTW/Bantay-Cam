import { errorService } from './errorService';
import { ErrorType, ErrorSeverity } from '../types';

interface SMSProxyResponse {
  success: boolean;
  data?: {
    message_id: string;
    status: string;
  };
  error?: string;
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
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, body }),
      });

      const rawBody = await response.text();
      let payload: SMSProxyResponse = {
        success: false,
        error: `HTTP ${response.status}`,
      };

      const looksLikeViteProxyFailure =
        response.status === 500 &&
        /econnrefused|proxy error|target server/i.test(rawBody);
      if (looksLikeViteProxyFailure) {
        payload = {
          success: false,
          error: 'SMS proxy is not reachable. Start it with: npm run dev:proxy',
        };
      }

      if (rawBody && !looksLikeViteProxyFailure) {
        try {
          payload = JSON.parse(rawBody) as SMSProxyResponse;
        } catch {
          payload = {
            success: false,
            error: `Non-JSON response from SMS proxy (HTTP ${response.status})`,
          };
        }
      }

      if (!response.ok || !payload.success) {
        const message = payload.error || `HTTP ${response.status}`;
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
        actionRequired: 'Verify backend proxy and ClickSend credentials',
        context: { error: message, to },
      });
      return {
        success: false,
        error: message,
      };
    }
  }
}

export const smsProxyService = SMSProxyService.getInstance();
