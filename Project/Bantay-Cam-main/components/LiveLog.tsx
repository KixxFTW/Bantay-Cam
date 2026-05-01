
import React from 'react';
import { LogEntry, SecurityStatus, ThreatRecording } from '../types';

interface LiveLogProps {
  logs: LogEntry[];
  recordings: ThreatRecording[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
}

const LiveLog: React.FC<LiveLogProps> = ({ logs, recordings, searchQuery, onSearchChange, onClear }) => {
  const getStatusColor = (status: SecurityStatus) => {
    switch (status) {
      case SecurityStatus.DANGER: return 'text-red-400 border-red-800 bg-red-950/35';
      case SecurityStatus.CAUTION: return 'text-amber-300 border-amber-800 bg-amber-950/35';
      case SecurityStatus.SAFE: return 'text-emerald-300 border-emerald-800 bg-emerald-950/35';
      default: return 'text-slate-400 border-slate-800';
    }
  };

  const getDescription = (log: LogEntry) => {
    if (log.status === SecurityStatus.DANGER) {
      return 'Immediate threat detected. Security response required now.';
    }
    if (log.status === SecurityStatus.CAUTION) {
      return 'Suspicious activity detected. Verify scene and prepare response.';
    }
    return 'Scene appears safe. Continue normal monitoring.';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 w-80 shrink-0">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Incident Feed
          </h2>
          <button onClick={onClear} className="text-[9px] text-slate-500 hover:text-red-400 font-bold uppercase transition-colors">Clear</button>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-8 py-1.5 text-[10px] focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <svg className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-xs text-center mt-4 space-y-2 opacity-50">
             <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse"></div>
            <p>Scanning matrix...<br/>No incidents logged.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className={`p-2 rounded border text-[10px] font-mono shadow-sm animate-in slide-in-from-right-5 fade-in duration-300 ${getStatusColor(log.status)}`}
            >
              <div className="flex justify-between items-center mb-1 opacity-70 border-b border-white/10 pb-1">
                <span>{log.timestamp}</span>
                <span className="font-bold">{log.confidence}% REL</span>
              </div>
              
              <div className="font-bold text-xs my-1 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  log.status === SecurityStatus.DANGER
                    ? 'bg-red-400'
                    : log.status === SecurityStatus.CAUTION
                      ? 'bg-amber-300'
                      : 'bg-emerald-300'
                }`}></span>
                {log.status}
              </div>
              <div className="text-[9px] opacity-85 mb-1 leading-tight">{getDescription(log)}</div>

              {log.hazards.length > 0 && (
                <ul className="list-disc list-inside mb-1 opacity-90 pl-1 leading-normal">
                  {log.hazards.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              )}
              
              <div className="mt-1 pt-1 opacity-80 border-t border-white/5 leading-tight">
                <span className="text-[8px] font-bold text-white/40 uppercase block mb-0.5">Recommended Response:</span>
                {log.action}
              </div>
            </div>
          ))
        )}

        <div className="pt-2 border-t border-slate-800/70 mt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-2">
            Threat Recordings
          </div>
          {recordings.length === 0 ? (
            <div className="text-[10px] text-slate-500">No recordings yet.</div>
          ) : (
            <div className="space-y-3">
              {recordings.map((clip) => (
                <div key={clip.id} className="border border-slate-700 bg-slate-950/60 rounded p-2">
                  <div className="text-[9px] text-slate-400 mb-1">{clip.createdAt}</div>
                  <div className="text-[10px] text-slate-300 mb-1">
                    {clip.sourceLabel} - {clip.reason}
                  </div>
                  <video controls src={clip.url} className="w-full rounded bg-black" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveLog;
