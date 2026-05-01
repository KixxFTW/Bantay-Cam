import { useState, useCallback, useEffect } from 'react';
import { LogEntry, SecurityStatus } from '../types';
import { smsProxyService } from '../services/smsProxyService';
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

export const useSMSAlerts = () => {
  const [config, setConfig] = useState<SMSConfig>({
    enabled: localStorage.getItem('sms_enabled') === 'true',
    recipients: JSON.parse(localStorage.getItem('sms_recipients') || '[]') as string[],
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
        error: 'Invalid PH number. Use format: +639171234567 or 09171234567'
      };
    }

    // Normalize to +63 format
    const normalized = trimmed.startsWith('0') 
      ? '+63' + trimmed.slice(1)
      : trimmed;

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
    if (!config.enabled || config.recipients.length === 0) return;
    if (result.status !== SecurityStatus.DANGER && result.status !== SecurityStatus.CAUTION) return;

    const severity = result.status === SecurityStatus.DANGER ? 'DANGER' : 'CAUTION';
    const cooldownKey = `${severity.toLowerCase()}_last_alert`;
    const cooldownMs = severity === 'DANGER' ? config.dangerCooldownMs : config.cautionCooldownMs;
    const lastTime = lastAlertTime[cooldownKey] || 0;
    const now = Date.now();

    if (now - lastTime < cooldownMs) {
      return; // Still in cooldown
    }

    setLastAlertTime(prev => ({ ...prev, [cooldownKey]: now }));

    const emoji = severity === 'DANGER' ? '🚨' : '⚠️';
    const hazardSummary = result.hazards.length > 0 ? result.hazards.join(', ') : 'No hazard details';
    const alertMessage = `${emoji} BantayCam Alert\n\n${severity}: ${hazardSummary}\nAction: ${result.action}\nTime: ${new Date().toLocaleTimeString()}`;

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
