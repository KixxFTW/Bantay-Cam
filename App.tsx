
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CameraMode, SecurityStatus, DeviceId } from './types';

// Components
import CameraFeed from './components/CameraFeed';
import LiveLog from './components/LiveLog';
import SensorPanel from './components/SensorPanel';
import SMSNotification from './components/SMSNotification';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/Signin/LandingPage';

// Custom Hooks
import { useCameraDevices } from './hooks/useCameraDevices';
import { useSensorData } from './hooks/useSensorData';
import { useFrameAnalysis } from './hooks/useFrameAnalysis';
import { useSecurityLogs } from './hooks/useSecurityLogs';

const App: React.FC = () => {
  const [hasSession, setHasSession] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>(CameraMode.NORMAL);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionAlert, setConnectionAlert] = useState<string | null>(null);
  const [unhealthyCameraIds, setUnhealthyCameraIds] = useState<Set<DeviceId>>(new Set());

  // Hook orchestration
  const { cameraSources, primaryCameraId, setPrimaryCameraId, isLoading: isHardwareLoading } = useCameraDevices();
  const { sensorData } = useSensorData(2000);
  const { 
    logs, 
    addLog, 
    stats, 
    searchQuery, 
    setSearchQuery, 
    exportLogs, 
    clearLogs 
  } = useSecurityLogs(50);
  
  const { processFrame, isAnalyzing } = useFrameAnalysis({
    onAnalysisComplete: (result) => {
      addLog(result);
      if (result.status === SecurityStatus.DANGER && window.navigator.vibrate) {
        window.navigator.vibrate([500, 100, 500]);
      }
    },
    rateLimitMs: 3000
  });

  // Reset unhealthy cameras when hardware list changes
  useEffect(() => {
    setUnhealthyCameraIds(new Set());
  }, [cameraSources]);

  const handleCameraTerminalError = useCallback((id: DeviceId) => {
    setUnhealthyCameraIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleConnectionLost = useCallback((label: string) => {
    setConnectionAlert(`CRITICAL ERROR: Connection to ${label} was severed.`);
  }, []);

  const toggleScanning = () => setIsScanning(prev => !prev);

  // Filter list to only show active, connected, and healthy devices
  const activeCameras = cameraSources.filter(cam => !unhealthyCameraIds.has(cam.id));
  
  // Derived UI State
  const activeThreat = logs.length > 0 && logs[0].status === SecurityStatus.DANGER;

  // Camera Grid Logic: Always exactly 4 slots
  const renderCameraGrid = () => {
    const slots = [0, 1, 2, 3];
    return (
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-6">
        {slots.map((index) => {
          const cam = activeCameras[index];
          if (cam) {
            return (
              <CameraFeed 
                key={cam.id}
                deviceId={cam.id}
                cameraLabel={cam.label}
                mode={cameraMode} 
                onFrameCapture={(base64) => processFrame(base64, sensorData)} 
                onConnectionLost={handleConnectionLost}
                onTerminalError={handleCameraTerminalError}
                isScanning={isScanning} 
                isPrimary={cam.id === primaryCameraId}
                onClick={() => setPrimaryCameraId(cam.id)}
              />
            );
          }
          return (
            <div 
              key={`empty-${index}`} 
              className="relative w-full h-full bg-slate-900/40 rounded-xl overflow-hidden border-2 border-dashed border-slate-800/50 flex flex-col items-center justify-center group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 mb-4 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/50 group-hover:border-cyan-500/30 transition-colors">
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-cyan-500/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Channel {index + 1}</div>
                <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  No Camera Connected
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-500/5 shadow-[0_0_10px_rgba(6,182,212,0.1)] animate-[scan_4s_linear_infinite]"></div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!hasSession) {
    return (
      <ErrorBoundary>
        <LandingPage onAuthenticated={() => setHasSession(true)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-200">
        
        {connectionAlert && (
          <SMSNotification 
            message={connectionAlert} 
            onDismiss={() => setConnectionAlert(null)} 
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          
          <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <svg className="w-5 h-5 text-cyan-500" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-white leading-tight">Bantay Cam</h1>
                <div className="flex items-center gap-2 text-[9px] text-cyan-400 font-mono uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Active Monitoring System
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 pr-4 border-r border-slate-800">
                <div className="text-right">
                  <div className="text-[8px] uppercase text-slate-500 font-bold">Reliability Score</div>
                  <div className="text-xs font-mono text-cyan-400">{stats.avgConfidence}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] uppercase text-slate-500 font-bold">Threat Count</div>
                  <div className={`text-xs font-mono ${stats.danger > 0 ? 'text-red-500' : 'text-slate-400'}`}>{stats.danger}</div>
                </div>
              </div>

              <div className="flex gap-1 p-1 bg-slate-950/50 border border-slate-800 rounded-lg">
                {(['NORMAL', 'LOW_LIGHT', 'THERMAL'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setCameraMode(CameraMode[m])}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                      cameraMode === CameraMode[m] 
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasSession(false)}
                  className="hidden sm:block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700 rounded-lg transition-all"
                  title="Return to login"
                >
                  Sign out
                </button>
                <button 
                  onClick={exportLogs}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Export Logs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                
                <button
                  onClick={toggleScanning}
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all border ${
                    isScanning 
                      ? 'bg-red-500/10 text-red-500 border-red-500/50 animate-pulse' 
                      : 'bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-500 shadow-xl shadow-cyan-900/20'
                  }`}
                >
                  {isScanning ? 'STOP SENSORS' : 'INITIALIZE SCAN'}
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 relative bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden">
            {activeThreat && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[40] bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-bounce flex items-center gap-4">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                CRITICAL THREAT: SECURITY BREACH DETECTED
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute top-6 right-6 z-[40] flex items-center gap-3 bg-cyan-950/40 border border-cyan-500/30 px-4 py-2 rounded-full backdrop-blur-md">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">AI Analysis</span>
              </div>
            )}
            
            {!isHardwareLoading ? renderCameraGrid() : (
              <div className="w-full h-full flex items-center justify-center">
                 <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            )}
          </main>

          <div className="shrink-0">
            <SensorPanel data={sensorData} />
          </div>
        </div>

        <div className="shrink-0 shadow-2xl">
          <LiveLog 
            logs={logs} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearLogs}
          />
        </div>
      </div>
      <style>{`
        @keyframes scan {
          from { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          to { top: 100%; opacity: 0; }
        }
      `}</style>
    </ErrorBoundary>
  );
};

export default App;
