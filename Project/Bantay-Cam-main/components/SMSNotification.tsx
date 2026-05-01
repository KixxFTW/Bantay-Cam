
import React, { useEffect, useState } from 'react';

interface SMSNotificationProps {
  message: string;
  onDismiss: () => void;
}

const SMSNotification: React.FC<SMSNotificationProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm transition-all duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
      }`}
    >
      <div className="mx-4 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/50">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L3 7V17L12 22L21 17V7L12 2Z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Bantay Cam System</span>
                <span className="text-[10px] text-slate-400 font-mono">JUST NOW</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-none mt-1">EMERGENCY ALERT</h4>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-snug">
            {message}
          </p>
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
      {/* Visual background pulse */}
      <div className="absolute inset-0 -z-10 bg-red-500/20 blur-2xl rounded-full animate-pulse"></div>
    </div>
  );
};

export default SMSNotification;
