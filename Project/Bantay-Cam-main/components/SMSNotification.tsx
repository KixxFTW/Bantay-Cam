
import React, { useEffect, useMemo, useState } from 'react';

interface SMSNotificationProps {
  message: string;
  onDismiss: () => void;
  /** Tailwind vertical offset when stacking (e.g. `top-36` under another toast). */
  positionClassName?: string;
}

/** Matches detection copy from `formatBantayCamThreatSmsBody` / SMS. */
function parseBantayCamDetectionMessage(message: string): { title: string; body: string } | null {
  const m = message.trim();
  const match = m.match(/^BantayCAM\s+Alert:\s*(.+)$/is);
  if (!match) return null;
  const body = match[1].trim();
  if (!body) return null;
  return { title: 'BantayCAM Alert', body };
}

const SMSNotification: React.FC<SMSNotificationProps> = ({
  message,
  onDismiss,
  positionClassName,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const parsed = useMemo(() => parseBantayCamDetectionMessage(message), [message]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const accentClass = parsed
    ? 'text-red-400 border-red-500/40 bg-red-500/15'
    : 'text-cyan-400 border-cyan-500/30 bg-cyan-600';

  const ringPulseClass = parsed ? 'bg-red-500/20' : 'bg-red-500/20';

  const title = parsed ? parsed.title : 'EMERGENCY ALERT';

  return (
    <div
      className={`fixed ${positionClassName ?? 'top-4'} left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm transition-all duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
      }`}
    >
      <div className="mx-4 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/50">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ring-1 ring-white/20 ${accentClass}`}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L3 7V17L12 22L21 17V7L12 2Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest truncate">
                  Bantay Cam System
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">JUST NOW</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug mt-1">{title}</h4>
            </div>
          </div>

          {parsed ? (
            <p className="text-sm text-slate-200 leading-snug">{parsed.body}</p>
          ) : (
            <p className="text-sm text-slate-200 leading-snug">{message}</p>
          )}

          <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={onDismiss}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
      <div className={`absolute inset-0 -z-10 blur-2xl rounded-full animate-pulse ${ringPulseClass}`} />
    </div>
  );
};

export default SMSNotification;
