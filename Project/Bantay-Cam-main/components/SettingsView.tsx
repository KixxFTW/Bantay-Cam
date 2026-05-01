import React, { useState } from 'react';

interface SettingsViewProps {
  scanInterval: number;
  onIntervalChange: (v: number) => void;
  stats: { danger: number };
  smsConfig: {
    enabled: boolean;
    recipients: string[];
    dangerCooldownMs: number;
    cautionCooldownMs: number;
  };
  smsTestStatus: {
    sending: boolean;
    message: string | null;
    isError: boolean;
  };
  onSetSmsEnabled: (enabled: boolean) => void;
  onAddRecipient: (phone: string) => { ok: boolean; error?: string };
  onRemoveRecipient: (phone: string) => void;
  onSetDangerCooldown: (ms: number) => void;
  onSetCautionCooldown: (ms: number) => void;
  onSendTestMessage: () => Promise<void>;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  scanInterval,
  onIntervalChange,
  stats,
  smsConfig,
  smsTestStatus,
  onSetSmsEnabled,
  onAddRecipient,
  onRemoveRecipient,
  onSetDangerCooldown,
  onSetCautionCooldown,
  onSendTestMessage
}) => {
  const [recipientInput, setRecipientInput] = useState('');
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const submitRecipient = () => {
    const result = onAddRecipient(recipientInput);
    if (!result.ok) {
      setRecipientError(result.error ?? 'Invalid number.');
      return;
    }
    setRecipientInput('');
    setRecipientError(null);
  };

  return (
    <div className="h-full bg-slate-950 p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6 overflow-y-auto pb-20 sm:pb-24 animate-in fade-in scale-95 duration-200">
      <div>
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">System Configuration</h2>
        <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">Adjust the AI monitoring parameters and security protocols for Bantay Cam.</p>
      </div>

      <section className="space-y-3 sm:space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-slate-300">Scan Interval</span>
            <span className="text-[10px] sm:text-xs font-mono text-cyan-400">{(scanInterval / 1000).toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={scanInterval}
            onChange={(e) => onIntervalChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[8px] text-slate-600 font-bold">AGGRESSIVE</span>
            <span className="text-[8px] text-slate-600 font-bold">BALANCED</span>
          </div>
        </div>
      </section>

      <section className="space-y-3 sm:space-y-4">
        <h3 className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-2">SMS Alerts</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-2 sm:px-3 py-2 text-[9px] sm:text-[10px] text-amber-300 leading-snug">
            Frontend ClickSend keys are for local development only. Use a backend proxy for production to keep credentials secure.
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-300">Enable SMS Alerts</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 leading-snug">Alert on CAUTION and DANGER events</span>
            </div>
            <button
              type="button"
              onClick={() => onSetSmsEnabled(!smsConfig.enabled)}
              className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors ${smsConfig.enabled ? 'bg-cyan-600' : 'bg-slate-700'}`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${smsConfig.enabled ? 'translate-x-6' : 'translate-x-1'} mt-1`} />
            </button>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-3 sm:pt-4">
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">Recipients</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="+639171234567"
                className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2 sm:px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 text-[12px]"
              />
              <button
                type="button"
                onClick={submitRecipient}
                className="px-3 py-2 text-[10px] sm:text-[11px] font-bold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors flex-shrink-0"
              >
                Add
              </button>
            </div>
            {recipientError && (
              <p className="text-[10px] text-red-400">{recipientError}</p>
            )}
            <div className="space-y-2 max-h-32 sm:max-h-36 overflow-y-auto pr-1">
              {smsConfig.recipients.length === 0 ? (
                <div className="text-[10px] text-slate-500">No recipients configured.</div>
              ) : (
                smsConfig.recipients.map((recipient) => (
                  <div key={recipient} className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 sm:px-3 py-2 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 truncate">{recipient}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveRecipient(recipient)}
                      className="text-[9px] sm:text-[10px] font-bold text-red-400 hover:text-red-300 flex-shrink-0 whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-3 sm:pt-4">
            <RangeControl
              label="Danger Cooldown"
              valueMs={smsConfig.dangerCooldownMs}
              min={30_000}
              max={600_000}
              step={30_000}
              onChange={onSetDangerCooldown}
            />
            <RangeControl
              label="Caution Cooldown"
              valueMs={smsConfig.cautionCooldownMs}
              min={60_000}
              max={900_000}
              step={30_000}
              onChange={onSetCautionCooldown}
            />
          </div>

          <button
            type="button"
            onClick={() => void onSendTestMessage()}
            disabled={smsTestStatus.sending}
            className="w-full px-3 py-2 rounded-lg text-[10px] sm:text-[11px] font-bold border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 transition-colors disabled:opacity-60"
          >
            {smsTestStatus.sending ? 'Sending test message...' : 'Send Test Message'}
          </button>
          {smsTestStatus.message && (
            <div className={`text-[10px] ${smsTestStatus.isError ? 'text-red-400' : 'text-emerald-400'}`}>
              {smsTestStatus.message}
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2 sm:mb-3 px-2">Diagnostics</h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DiagCard label="Uptime" value="1h 22m" />
          <DiagCard label="Engine" value="Gemini 3 Flash" />
          <DiagCard label="API Latency" value="842ms" />
          <DiagCard label="Active Threats" value={String(stats.danger)} />
        </div>
      </section>

      <div className="mt-auto p-3 sm:p-4 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 text-center">
        <div className="text-[9px] sm:text-[10px] font-mono text-slate-500 mb-2">Bantay Cam Build v1.4.2</div>
        <div className="flex justify-center gap-3 sm:gap-4 text-[8px] sm:text-[9px] font-bold text-cyan-400 uppercase tracking-widest flex-wrap">
          <a href="#">Privacy</a>
          <a href="#">Support</a>
          <a href="#">v0.dev</a>
        </div>
      </div>
    </div>
  );
};

const RangeControl: React.FC<{
  label: string;
  valueMs: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}> = ({ label, valueMs, min, max, step, onChange }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400">{Math.round(valueMs / 1000)}s</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={valueMs}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

const DiagCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-900 border border-slate-800 p-2 sm:p-3 rounded-xl">
    <div className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">{label}</div>
    <div className="text-[10px] sm:text-[11px] font-mono text-slate-300">{value}</div>
  </div>
);

export default SettingsView;
