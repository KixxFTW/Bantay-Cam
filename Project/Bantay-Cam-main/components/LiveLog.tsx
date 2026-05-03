import React, { useMemo, useState } from 'react';
import { LogEntry, ThreatRecording, SecurityStatus } from '../types';
import RecordingsPanel from './RecordingsPanel';

interface LiveLogProps {
  logs: LogEntry[];
  recordings: ThreatRecording[];
  onDeleteRecording: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
}

type SidebarTab = 'logs' | 'recordings';

const LiveLog: React.FC<LiveLogProps> = ({ logs, recordings, onDeleteRecording, searchQuery, onSearchChange, onClear }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('logs');

  const getStatusColor = (status: SecurityStatus) => {
    switch (status) {
      case SecurityStatus.DANGER: return 'text-red-500 border-red-900 bg-red-950/30';
      case SecurityStatus.CAUTION: return 'text-amber-400 border-amber-900 bg-amber-950/30';
      case SecurityStatus.SAFE: return 'text-emerald-400 border-emerald-900 bg-emerald-950/30';
      default: return 'text-slate-400 border-slate-800';
    }
  };

  const counts = useMemo(() => {
    const threat = recordings.filter((r) => r.recordingType === 'threat-clip').length;
    const session = recordings.filter((r) => r.recordingType === 'session').length;
    return { logs: logs.length, recordings: recordings.length, threat, session };
  }, [logs.length, recordings]);

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 w-80 shrink-0">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Bantay Cam
          </h2>
          <button onClick={onClear} className="text-[9px] text-slate-500 hover:text-red-400 font-bold uppercase transition-colors">Clear</button>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`flex-1 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-slate-950/60 text-cyan-400 border-slate-700 shadow-[0_0_25px_rgba(6,182,212,0.10)]'
                : 'bg-slate-950/30 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
            }`}
          >
            Logs
            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono ${
              activeTab === 'logs' ? 'border-white/10 text-slate-200 bg-black/30' : 'border-slate-800 text-slate-500 bg-black/20'
            }`}>
              {counts.logs}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recordings')}
            className={`flex-1 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeTab === 'recordings'
                ? 'bg-slate-950/60 text-cyan-400 border-slate-700 shadow-[0_0_25px_rgba(6,182,212,0.10)]'
                : 'bg-slate-950/30 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
            }`}
          >
            Recordings
            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono ${
              activeTab === 'recordings' ? 'border-white/10 text-slate-200 bg-black/30' : 'border-slate-800 text-slate-500 bg-black/20'
            }`}>
              {counts.recordings}
            </span>
          </button>
        </div>
        
        {activeTab === 'logs' && (
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
        )}
      </div>

      {activeTab === 'recordings' ? (
        <div className="flex-1 min-h-0">
          <RecordingsPanel recordings={recordings} onDelete={onDeleteRecording} />
        </div>
      ) : (
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
                
                <div className="font-bold text-xs my-1">{log.status}</div>

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
        </div>
      )}
    </div>
  );
};

export default LiveLog;
