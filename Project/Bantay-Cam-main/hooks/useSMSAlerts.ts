import { useState, useCallback, useEffect } from 'react';
import { LogEntry, SecurityStatus } from '../types';
import { smsProxyService, normalizePhilippineMobileForSms } from '../services/smsProxyService';
import { errorService } from '../services/errorService';
import { ErrorType, ErrorSeverity } from '../types';

interface TestStatus {
  sending: boolean;
  message: string | null;
  isError: boolean;
}

interface SMSConfig {
  enabled: boolean;
  recipients: string[];
  dangerCooldownMs: number;
  cautionCooldownMs: number;
}

const CRITICAL_HAZARD_PATTERN = /\b(knife|gun|fire|smoke)\b/i;
const hasCriticalThreatText = (value: string | undefined) =>
  Boolean(value && CRITICAL_HAZARD_PATTERN.test(value));

/** Detection SMS + in-app alert copy (single message for CAUTION/DANGER). */
export const BANTAYCAM_DETECTION_SMS_MESSAGE =
  'BantayCAM Alert: A potential threat has been detected. Please check your CCTV footage as soon as possible.';

/** Same body sent as SMS; used by in-app alert UI. */
export function formatBantayCamThreatSmsBody(result: LogEntry): string | null {
  const hasCriticalHazard = result.hazards.some(hasCriticalThreatText);
  const hasCriticalAction = hasCriticalThreatText(result.action);
  const shouldEscalateToDanger =
    result.status === SecurityStatus.DANGER || hasCriticalHazard || hasCriticalAction;
  if (!shouldEscalateToDanger && result.status !== SecurityStatus.CAUTION) return null;

  return BANTAYCAM_DETECTION_SMS_MESSAGE;
}

const loadRecipientsFromStorage = (): string[] => {
  try {
    const raw = JSON.parse(localStorage.getItem('sms_recipients') || '[]') as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((n): n is string => typeof n === 'string')
      .map((n) => normalizePhilippineMobileForSms(n));
  } catch {
    return [];
  }
};

export const useSMSAlerts = () => {
  const [config, setConfig] = useState<SMSConfig>({
    enabled: localStorage.getItem('sms_enabled') === 'true',
    recipients: loadRecipientsFromStorage(),
    dangerCooldownMs: parseInt(localStorage.getItem('sms_danger_cooldown') || '180000', 10), // 3min
    cautionCooldownMs: parseInt(localStorage.getItem('sms_caution_cooldown') || '300000', 10), // 5min
  });

  const [lastAlertTime, setLastAlertTime] = useState<{ [key: string]: number }>({});
  const [testStatus, setTestStatus] = useState<TestStatus>({
    sending: false,
    message: null,
    isError: false,
  });

  // Persist config to localStorage
  useEffect(() => {
    localStorage.setItem('sms_enabled', String(config.enabled));
    localStorage.setItem('sms_recipients', JSON.stringify(config.recipients));
    localStorage.setItem('sms_danger_cooldown', String(config.dangerCooldownMs));
    localStorage.setItem('sms_caution_cooldown', String(config.cautionCooldownMs));
  }, [config]);

  const setEnabled = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, enabled }));
  }, []);

  const addRecipient = useCallback((phone: string) => {
    const trimmed = phone.trim();
    
    // Validate Philippine number
    if (!trimmed.match(/^(\+63|0)9\d{9}$/)) {
      return {
        ok: false,
        error: 'Invalid PH number. Use format: 09171234567 (+639171234567 also accepted)'
      };
    }

    const normalized = normalizePhilippineMobileForSms(trimmed);

    if (config.recipients.includes(normalized)) {
      return { ok: false, error: 'This number is already added.' };
    }

    setConfig(prev => ({
      ...prev,
      recipients: [...prev.recipients, normalized]
    }));
    return { ok: true };
  }, [config.recipients]);

  const removeRecipient = useCallback((phone: string) => {
    setConfig(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== phone)
    }));
  }, []);

  const setDangerCooldown = useCallback((ms: number) => {
    setConfig(prev => ({ ...prev, dangerCooldownMs: ms }));
  }, []);

  const setCautionCooldown = useCallback((ms: number) => {
    setConfig(prev => ({ ...prev, cautionCooldownMs: ms }));
  }, []);

  const sendTestMessage = useCallback(async () => {
    if (config.recipients.length === 0) {
      setTestStatus({
        sending: false,
        message: 'No recipients configured.',
        isError: true,
      });
      return;
    }

    setTestStatus({ sending: true, message: null, isError: false });

    try {
      const testMessage = `🔒 BantayCam Test Alert\n\nThis is a test message from your security system. All systems operational.`;
      
      const results = await Promise.all(
        config.recipients.map((recipient: string) =>
          smsProxyService.sendSMS(recipient, testMessage)
        )
      );

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        setTestStatus({
          sending: false,
          message: `✓ Sent to ${results.length - failed.length}/${results.length} recipients`,
          isError: false,
        });
      } else {
        setTestStatus({
          sending: false,
          message: `✓ Test message sent to ${config.recipients.length} recipient(s)`,
          isError: false,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setTestStatus({
        sending: false,
        message: `✗ Failed: ${message}`,
        isError: true,
      });
    }

    setTimeout(() => {
      setTestStatus({ sending: false, message: null, isError: false });
    }, 4000);
  }, [config.recipients]);

  const handleAnalysisResult = useCallback(async (result: LogEntry) => {
    const alertMessage = formatBantayCamThreatSmsBody(result);
    if (!alertMessage) return;
    if (!config.enabled || config.recipients.length === 0) return;

    const hasCriticalHazard = result.hazards.some(hasCriticalThreatText);
    const hasCriticalAction = hasCriticalThreatText(result.action);
    const shouldEscalateToDanger =
      result.status === SecurityStatus.DANGER || hasCriticalHazard || hasCriticalAction;
    const severity = shouldEscalateToDanger ? 'DANGER' : 'CAUTION';
    const cooldownKey = `${severity.toLowerCase()}_last_alert`;
    const cooldownMs = severity === 'DANGER' ? config.dangerCooldownMs : config.cautionCooldownMs;
    const lastTime = lastAlertTime[cooldownKey] || 0;
    const now = Date.now();

    if (now - lastTime < cooldownMs) {
      return; // Still in cooldown
    }

    setLastAlertTime(prev => ({ ...prev, [cooldownKey]: now }));

    try {
      await Promise.all(
        config.recipients.map((recipient: string) =>
          smsProxyService.sendSMS(recipient, alertMessage)
        )
      );
    } catch (err: unknown) {
      errorService.log({
        type: 'SMS' as unknown as ErrorType,
        severity: ErrorSeverity.HIGH,
        message: 'Failed to send SMS alert',
        context: { error: err instanceof Error ? err.message : 'Unknown' }
      });
    }
  }, [config.enabled, config.recipients, config.dangerCooldownMs, config.cautionCooldownMs, lastAlertTime]);

  const smsSummary = {
    smsEnabled: config.enabled,
    recipientCount: config.recipients.length,
  };

  return {
    config,
    smsSummary,
    testStatus,
    setEnabled,
    addRecipient,
    removeRecipient,
    setDangerCooldown: setDangerCooldown,
    setCautionCooldown: setCautionCooldown,
    sendTestMessage,
    handleAnalysisResult,
  };
};
