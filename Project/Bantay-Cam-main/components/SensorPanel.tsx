
import React from 'react';
import { SensorData } from '../types';

interface SensorPanelProps {
  data: SensorData;
}

const SensorPanel: React.FC<SensorPanelProps> = ({ data }) => {
  const dangerScore =
    (data.motionDetected ? 2 : 0) +
    (data.audioLevel > 80 ? 1 : 0) +
    (data.temperature > 30 ? 1 : 0);

  const dangerLevel =
    dangerScore >= 3 ? 'HIGH' : dangerScore >= 1 ? 'MEDIUM' : 'LOW';
  const dangerTone =
    dangerLevel === 'HIGH' ? 'high' : dangerLevel === 'MEDIUM' ? 'medium' : 'low';

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
        label="Danger Level" 
        value={dangerLevel} 
        detail={dangerLevel === 'LOW' ? 'No immediate threat' : 'Threat detected'}
        tone={dangerTone}
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-7.938 4h15.876c1.54 0 2.503-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L2.33 16c-.77 1.333.192 3 1.732 3z" />}
        alert={dangerLevel !== 'LOW'}
      />
    </div>
  );
};

const SensorCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  alert: boolean;
  tone?: 'default' | 'low' | 'medium' | 'high';
  detail?: string;
}> = ({ label, value, icon, alert, tone = 'default', detail }) => {
  const toneClasses =
    tone === 'high'
      ? {
          card: 'bg-red-950/20 border-red-500/50 text-red-400 scale-[1.02]',
          icon: 'bg-red-500/20 text-red-500',
          value: 'text-red-400',
        }
      : tone === 'medium'
        ? {
            card: 'bg-amber-950/20 border-amber-500/50 text-amber-300 scale-[1.02]',
            icon: 'bg-amber-500/20 text-amber-400',
            value: 'text-amber-300',
          }
        : tone === 'low'
          ? {
              card: 'bg-emerald-950/20 border-emerald-500/50 text-emerald-300',
              icon: 'bg-emerald-500/20 text-emerald-400',
              value: 'text-emerald-300',
            }
          : {
              card: alert ? 'bg-red-950/20 border-red-500/50 text-red-400 scale-[1.02]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600',
              icon: alert ? 'bg-red-500/20 text-red-500' : 'bg-slate-700 text-slate-500',
              value: alert ? 'text-red-400' : 'text-slate-200',
            };

  return (
  <div className={`p-3 rounded border transition-all duration-300 ${toneClasses.card} flex items-center gap-3`}>
    <div className={`p-2 rounded-lg ${toneClasses.icon}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
    </div>
    <div className="min-w-0">
      <div className="text-[9px] uppercase tracking-wider opacity-60 truncate">{label}</div>
      <div className={`font-mono font-bold text-sm ${toneClasses.value}`}>{value}</div>
      {detail && <div className="text-[9px] opacity-70 mt-0.5">{detail}</div>}
    </div>
  </div>
  );
};

export default SensorPanel;
