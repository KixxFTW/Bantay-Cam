import React from 'react';

interface SettingsViewProps {
  scanInterval: number;
  onIntervalChange: (v: number) => void;
  stats: any;
}

const SettingsView: React.FC<SettingsViewProps> = ({ scanInterval, onIntervalChange, stats }) => {
  return (
    <div className="h-full bg-slate-950 p-6 flex flex-col gap-6 overflow-y-auto pb-24 animate-in fade-in scale-95 duration-200">
      <div>
        <h2 className="text-lg font-bold text-white mb-2">System Configuration</h2>
        <p className="text-xs text-slate-500 leading-snug">Adjust the AI monitoring parameters and security protocols for Bantay Cam.</p>
      </div>

      <section className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-300">Scan Interval</span>
            <span className="text-xs font-mono text-cyan-400">{(scanInterval / 1000).toFixed(1)}s</span>
          </div>
          <input 
            type="range" 
            min="1000" 
            max="10000" 
            step="500"
            value={scanInterval}
            onChange={(e) => onIntervalChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[8px] text-slate-600 font-bold">AGGRESSIVE</span>
            <span className="text-[8px] text-slate-600 font-bold">BALANCED</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-300">Push Notifications</span>
              <span className="text-[9px] text-slate-500">Alert on Caution/Danger status</span>
            </div>
            <div className="w-10 h-5 bg-cyan-600 rounded-full relative">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-300">Haptic Feedback</span>
              <span className="text-[9px] text-slate-500">Device vibration on danger events</span>
            </div>
            <div className="w-10 h-5 bg-cyan-600 rounded-full relative">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 px-2">Diagnostics</h3>
        <div className="grid grid-cols-2 gap-3">
          <DiagCard label="Uptime" value="1h 22m" />
          <DiagCard label="Engine" value="Gemini 3 Flash" />
          <DiagCard label="API Latency" value="842ms" />
          <DiagCard label="Memory" value="42.4 MB" />
        </div>
      </section>

      <div className="mt-auto p-4 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 text-center">
        <div className="text-[10px] font-mono text-slate-500 mb-2">Bantay Cam Build v1.4.2</div>
        <div className="flex justify-center gap-4 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
          <a href="#">Privacy</a>
          <a href="#">Support</a>
          <a href="#">v0.dev</a>
        </div>
      </div>
    </div>
  );
};

const DiagCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
    <div className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">{label}</div>
    <div className="text-[11px] font-mono text-slate-300">{value}</div>
  </div>
);

export default SettingsView;
