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

      const payload = (await response.json()) as SMSProxyResponse;

      if (!response.ok || !payload.success) {
        const message = payload.error || `HTTP ${response.status}`;
        throw new Error(message);
      }

      return payload;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
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
