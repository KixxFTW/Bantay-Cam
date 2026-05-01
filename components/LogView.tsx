
import React from 'react';
import { LogEntry, SecurityStatus } from '../types';

interface LogViewProps {
  logs: LogEntry[];
  searchQuery: string;
  onSearch: (q: string) => void;
  onClear: () => void;
  stats: any;
}

const LogView: React.FC<LogViewProps> = ({ logs, searchQuery, onSearch, onClear, stats }) => {
  const getBadgeStyle = (status: SecurityStatus) => {
    switch (status) {
      case SecurityStatus.DANGER: return 'border-red-600/50 bg-red-950/20 text-red-400';
      case SecurityStatus.CAUTION: return 'border-amber-600/50 bg-amber-950/20 text-amber-400';
      default: return 'border-emerald-600/50 bg-emerald-950/20 text-emerald-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="p-6 bg-slate-900/40 border-b border-slate-800 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-1 h-6 bg-cyan-500 rounded-full"></div>
             <h2 className="text-base font-black text-white uppercase tracking-[0.2em]">Security Log</h2>
          </div>
          <button 
            onClick={onClear} 
            className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-red-400 transition-colors bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            Purge Cache
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatMini label="Uptime" value="1h 22m" />
          <StatMini label="Threats" value={stats.danger} highlight={stats.danger > 0} />
          <StatMini label="Conf." value={`${stats.avgConfidence}%`} />
        </div>

        <div className="relative group">
          <input 
            type="text" 
            placeholder="FILTER BY THREAT OR HAZARD..." 
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-3.5 text-[11px] font-mono font-bold tracking-widest focus:outline-none focus:border-cyan-500/50 transition-all focus:ring-4 focus:ring-cyan-500/5 placeholder:text-slate-700"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-700">
            <div className="w-20 h-20 mb-6 bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-800">
               <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] font-black text-center opacity-40 leading-relaxed">System Idle<br/>No incidents registered</p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div 
              key={log.id} 
              className={`p-5 rounded-2xl border-l-4 border-y border-r transition-all duration-300 animate-in slide-in-from-right-6 ${getBadgeStyle(log.status)}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black opacity-60">ID:{log.id.slice(0, 8)}</span>
                  <span className="text-[10px] font-mono font-black opacity-60 bg-black/20 px-2 py-0.5 rounded">{log.timestamp}</span>
                </div>
                <div className="text-[10px] font-black tracking-widest uppercase opacity-80">
                  {log.status}
                </div>
              </div>
              
              {log.hazards.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {log.hazards.map((h, i) => (
                      <span key={i} className="text-[11px] font-bold bg-black/30 px-3 py-1 rounded-lg border border-white/5 text-white/90">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5 flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 </div>
                 <div className="flex-1">
                    <span className="text-[8px] uppercase text-white/30 font-black tracking-widest block mb-1">System Advice</span>
                    <p className="text-[12px] leading-relaxed text-white/70 font-medium italic">"{log.action}"</p>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatMini: React.FC<{ label: string; value: string | number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col transition-all hover:border-cyan-500/30">
    <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">{label}</span>
    <span className={`text-[13px] font-mono font-black ${highlight ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>{value}</span>
  </div>
);

export default LogView;
