
import React from 'react';
import { SensorData } from '../types';

interface SensorPanelProps {
  data: SensorData;
}

const SensorPanel: React.FC<SensorPanelProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900 border-t border-slate-800">
      <SensorCard 
        label="Audio Matrix" 
        value={`${data.audioLevel.toFixed(1)} dB`} 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />}
        alert={data.audioLevel > 80}
      />
      <SensorCard 
        label="Motion Grid" 
        value={data.motionDetected ? "PIR TRIGGER" : "STABLE"} 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
        alert={data.motionDetected}
      />
      <SensorCard 
        label="Thermal Array" 
        value={`${data.temperature.toFixed(1)}°C`} 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
        alert={data.temperature > 30}
      />
       <SensorCard 
        label="Atmospheric" 
        value={`${data.humidity.toFixed(1)}%`} 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />}
        alert={false}
      />
    </div>
  );
};

const SensorCard: React.FC<{ label: string; value: string; icon: React.ReactNode; alert: boolean }> = ({ label, value, icon, alert }) => (
  <div className={`p-3 rounded border transition-all duration-300 ${alert ? 'bg-red-950/20 border-red-500/50 text-red-400 scale-[1.02]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'} flex items-center gap-3`}>
    <div className={`p-2 rounded-lg ${alert ? 'bg-red-500/20 text-red-500' : 'bg-slate-700 text-slate-500'}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
    </div>
    <div className="min-w-0">
      <div className="text-[9px] uppercase tracking-wider opacity-60 truncate">{label}</div>
      <div className={`font-mono font-bold text-sm ${alert ? 'text-red-400' : 'text-slate-200'}`}>{value}</div>
    </div>
  </div>
);

export default SensorPanel;
