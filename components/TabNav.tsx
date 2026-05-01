
import React from 'react';
import { AppTab } from '../types';

interface TabNavProps {
  activeTab: AppTab;
  setActiveTab: (t: AppTab) => void;
}

const TabNav: React.FC<TabNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="h-20 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-6 absolute bottom-0 left-0 right-0 z-[60]">
      <TabItem 
        label="Monitor" 
        isActive={activeTab === 'monitor'} 
        onClick={() => setActiveTab('monitor')}
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
      />
      <TabItem 
        label="Logs" 
        isActive={activeTab === 'logs'} 
        onClick={() => setActiveTab('logs')}
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
      />
      <TabItem 
        label="System" 
        isActive={activeTab === 'settings'} 
        onClick={() => setActiveTab('settings')}
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
      />
    </nav>
  );
};

const TabItem: React.FC<{ label: string; isActive: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, isActive, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 group ${isActive ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
  >
    <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400'}`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
    </div>
    <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default TabNav;
