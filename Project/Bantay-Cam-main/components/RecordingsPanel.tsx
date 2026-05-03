import React, { useMemo, useState } from 'react';
import { ThreatRecording } from '../types';

type RecordingFilter = 'all' | 'threat-clip' | 'session';

interface RecordingsPanelProps {
  recordings: ThreatRecording[];
  onDelete: (id: string) => void;
}

const formatFileTimestamp = (createdAt: string) => {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) {
    return createdAt.replaceAll(/[^\w-]+/g, '-').slice(0, 32);
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const badgeClass = (type: ThreatRecording['recordingType']) => {
  return type === 'threat-clip'
    ? 'bg-red-950/60 border-red-500/40 text-red-300'
    : 'bg-slate-900/60 border-slate-700 text-slate-200';
};

const labelForType = (type: ThreatRecording['recordingType']) => {
  return type === 'threat-clip' ? 'THREAT CLIP' : 'SESSION';
};

const RecordingsPanel: React.FC<RecordingsPanelProps> = ({ recordings, onDelete }) => {
  const [activeFilter, setActiveFilter] = useState<RecordingFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const threat = recordings.filter((r) => r.recordingType === 'threat-clip').length;
    const session = recordings.filter((r) => r.recordingType === 'session').length;
    return { all: recordings.length, threat, session };
  }, [recordings]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return recordings;
    return recordings.filter((r) => r.recordingType === activeFilter);
  }, [recordings, activeFilter]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return recordings.find((r) => r.id === selectedId) ?? null;
  }, [recordings, selectedId]);

  const triggerDownload = (clip: ThreatRecording) => {
    const name = `bantay-cam-${clip.recordingType}-${formatFileTimestamp(clip.createdAt)}.webm`;
    const a = document.createElement('a');
    a.href = clip.url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const FilterTab = ({
    id,
    label,
    count,
    accent,
  }: {
    id: RecordingFilter;
    label: React.ReactNode;
    count: number;
    accent: string;
  }) => {
    const isActive = activeFilter === id;
    return (
      <button
        type="button"
        onClick={() => setActiveFilter(id)}
        className={`flex-1 px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
          isActive
            ? `bg-slate-950/60 ${accent} border-slate-700 shadow-[0_0_25px_rgba(6,182,212,0.10)]`
            : 'bg-slate-950/30 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
        }`}
      >
        <span className="truncate">{label}</span>
        <span
          className={`px-2 py-0.5 rounded-full border text-[9px] font-mono ${
            isActive ? 'border-white/10 text-slate-200 bg-black/30' : 'border-slate-800 text-slate-500 bg-black/20'
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="p-3 border-b border-slate-800 bg-slate-900/40 backdrop-blur">
        <div className="flex gap-2">
          <FilterTab id="all" label="All" count={counts.all} accent="text-cyan-400" />
          <FilterTab id="threat-clip" label={<span>⚡ Threat Clips</span>} count={counts.threat} accent="text-red-300" />
          <FilterTab id="session" label={<span>● Session</span>} count={counts.session} accent="text-slate-200" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-6">
            <div className="w-16 h-16 rounded-2xl border border-slate-800 bg-slate-900/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.06)]">
              <svg className="w-8 h-8 text-cyan-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">No recordings</div>
            <div className="text-[10px] font-mono mt-2 text-slate-600">
              Start scanning to create a session recording. Threat detections will generate threat clips.
            </div>
          </div>
        ) : (
          filtered.map((clip) => (
            <div
              key={clip.id}
              onClick={() => setSelectedId(clip.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedId(clip.id);
                }
              }}
              role="button"
              tabIndex={0}
              className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/45 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-widest ${badgeClass(clip.recordingType)}`}>
                      {labelForType(clip.recordingType)}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 truncate">{clip.sourceLabel}</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">{clip.createdAt}</div>
                  <div className="text-[10px] text-slate-300 mt-2 line-clamp-2">{clip.reason}</div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerDownload(clip);
                    }}
                    className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-950/40 text-[9px] font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 hover:border-slate-700 transition-colors"
                    title="Download"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(clip.id);
                      if (selectedId === clip.id) setSelectedId(null);
                    }}
                    className="px-2 py-1 rounded-lg border border-red-900/60 bg-red-950/30 text-[9px] font-bold uppercase tracking-widest text-red-300 hover:bg-red-950/50 transition-colors"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <video
                  className="w-full rounded-lg border border-slate-800 bg-black/30"
                  src={clip.url}
                  controls
                  preload="metadata"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[90]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          />
          <div className="absolute inset-0 p-4 md:p-10 flex items-center justify-center">
            <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-widest ${badgeClass(selected.recordingType)}`}>
                      {labelForType(selected.recordingType)}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 truncate">{selected.sourceLabel}</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 mt-1 truncate">{selected.createdAt}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => triggerDownload(selected)}
                    className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/40 text-[9px] font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 hover:border-slate-700 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="p-2 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 rounded-lg"
                    title="Close"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="text-[10px] text-slate-300 mb-3">{selected.reason}</div>
                <video
                  className="w-full max-h-[70vh] rounded-xl border border-slate-800 bg-black/40"
                  src={selected.url}
                  controls
                  autoPlay
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingsPanel;

