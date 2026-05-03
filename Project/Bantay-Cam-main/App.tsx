import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CameraMode, SecurityStatus, DeviceId, ThreatRecording, asLogId } from './types';

// Components
import CameraFeed from './components/CameraFeed';
import LiveLog from './components/LiveLog';
import SensorPanel from './components/SensorPanel';
import SMSNotification from './components/SMSNotification';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/Signin/LandingPage';
import SettingsView from './components/SettingsView';

// Custom Hooks
import { useCameraDevices } from './hooks/useCameraDevices';
import { useSensorData } from './hooks/useSensorData';
import { useFrameAnalysis } from './hooks/useFrameAnalysis';
import { useSecurityLogs } from './hooks/useSecurityLogs';
import { useSMSAlerts, formatBantayCamThreatSmsBody } from './hooks/useSMSAlerts';

const App: React.FC = () => {
  const [hasSession, setHasSession] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>(CameraMode.NORMAL);
  const [isScanning, setIsScanning] = useState(false);
  const [scanInterval, setScanInterval] = useState(3000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [connectionAlert, setConnectionAlert] = useState<string | null>(null);
  const [threatAlert, setThreatAlert] = useState<string | null>(null);
  const [unhealthyCameraIds, setUnhealthyCameraIds] = useState<Set<DeviceId>>(new Set());
  const [isMobileLogOpen, setIsMobileLogOpen] = useState(false);
  const [recordings, setRecordings] = useState<ThreatRecording[]>([]);
  const [recordingTrigger, setRecordingTrigger] = useState(0);
  const [lastRecordingReason, setLastRecordingReason] = useState('Threat detected');
  const lastRecordingAtRef = useRef(0);
  const recordingsRef = useRef<ThreatRecording[]>([]);
  const lastSensorDangerLevelRef = useRef<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const lastSensorLogAtRef = useRef(0);
  const lastThreatToastAtRef = useRef(0);

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

  const {
    config: smsConfig,
    smsSummary,
    testStatus: smsTestStatus,
    setEnabled: setSmsEnabled,
    addRecipient: addSmsRecipient,
    removeRecipient: removeSmsRecipient,
    setDangerCooldown: setDangerSmsCooldown,
    setCautionCooldown: setCautionSmsCooldown,
    sendTestMessage: sendSmsTestMessage,
    handleAnalysisResult: handleSmsAnalysis
  } = useSMSAlerts();
  
  const { processFrame, isAnalyzing } = useFrameAnalysis({
    onAnalysisComplete: (result) => {
      addLog(result);
      void handleSmsAnalysis(result);
      const threatBody = formatBantayCamThreatSmsBody(result);
      const now = Date.now();
      if (threatBody && now - lastThreatToastAtRef.current > 6000) {
        lastThreatToastAtRef.current = now;
        setThreatAlert(threatBody);
      }
      const hasThreat = result.status !== SecurityStatus.SAFE;
      const canRecord = Date.now() - lastRecordingAtRef.current > 15_000;
      if (hasThreat && canRecord) {
        lastRecordingAtRef.current = Date.now();
        setLastRecordingReason(result.hazards[0] || `${result.status} threat detected`);
        setRecordingTrigger((prev) => prev + 1);
      }
      if (window.navigator.vibrate) {
        window.navigator.vibrate([500, 100, 500]);
      }
    },
    rateLimitMs: 3000
  });

  const handleRecordingReady = useCallback((payload: { url: string; sourceLabel: string; recordingType: ThreatRecording['recordingType']; reason?: string }) => {
    setRecordings((prev) => {
      const next = [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toLocaleString(),
          sourceLabel: payload.sourceLabel,
          reason: payload.reason ?? lastRecordingReason,
          url: payload.url,
          recordingType: payload.recordingType,
        },
        ...prev,
      ].slice(0, 10);

      if (prev.length >= 10) {
        const removed = prev[prev.length - 1];
        if (removed) {
          URL.revokeObjectURL(removed.url);
        }
      }

      return next;
    });
  }, [lastRecordingReason]);

  const handleDeleteRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((r) => r.id !== id);
    });
  }, []);

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

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  useEffect(() => {
    if (!isScanning) {
      lastSensorDangerLevelRef.current = 'LOW';
      return;
    }

    const score =
      (sensorData.motionDetected ? 2 : 0) +
      (sensorData.audioLevel > 80 ? 1 : 0) +
      (sensorData.temperature > 30 ? 1 : 0);

    const dangerLevel: 'LOW' | 'MEDIUM' | 'HIGH' =
      score >= 3 ? 'HIGH' : score >= 1 ? 'MEDIUM' : 'LOW';

    const now = Date.now();
    const shouldLog =
      dangerLevel !== 'LOW' &&
      (dangerLevel !== lastSensorDangerLevelRef.current || now - lastSensorLogAtRef.current > 20_000);

    if (shouldLog) {
      addLog({
        id: asLogId(crypto.randomUUID()),
        status: dangerLevel === 'HIGH' ? SecurityStatus.DANGER : SecurityStatus.CAUTION,
        hazards: [
          `Sensor danger level ${dangerLevel}`,
          sensorData.motionDetected ? 'Motion detected' : 'No motion detected',
          `Audio ${sensorData.audioLevel.toFixed(1)} dB`,
          `Temperature ${sensorData.temperature.toFixed(1)} C`,
        ],
        action:
          dangerLevel === 'HIGH'
            ? 'Investigate immediately and verify the scene.'
            : 'Monitor closely and prepare for escalation.',
        confidence: dangerLevel === 'HIGH' ? 85 : 65,
        timestamp: new Date().toLocaleString(),
      });
      lastSensorLogAtRef.current = now;
    }

    lastSensorDangerLevelRef.current = dangerLevel;
  }, [sensorData, addLog, isScanning]);

  useEffect(() => {
    return () => {
      recordingsRef.current.forEach((clip) => URL.revokeObjectURL(clip.url));
    };
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
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-2 md:gap-6 p-2 md:p-0">
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
                recordTriggerToken={cam.id === primaryCameraId ? recordingTrigger : 0}
                onRecordingReady={handleRecordingReady}
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
              className="relative w-full h-full bg-slate-900/40 rounded-lg md:rounded-xl overflow-hidden border-2 border-dashed border-slate-800/50 flex flex-col items-center justify-center group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 md:w-12 h-8 md:h-12 mb-2 md:mb-4 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/50 group-hover:border-cyan-500/30 transition-colors">
                  <svg className="w-4 md:w-6 h-4 md:h-6 text-slate-600 group-hover:text-cyan-500/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-[9px] md:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Channel {index + 1}</div>
                <div className="text-[8px] md:text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  No Camera
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
      <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-200 flex-col md:flex-row">
        
        {connectionAlert && (
          <SMSNotification
            message={connectionAlert}
            onDismiss={() => setConnectionAlert(null)}
          />
        )}
        {threatAlert && (
          <SMSNotification
            message={threatAlert}
            onDismiss={() => setThreatAlert(null)}
            positionClassName={connectionAlert ? 'top-36' : 'top-4'}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          
          <header className="h-14 md:h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-3 md:px-6 shrink-0 z-10 gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="w-8 md:w-9 h-8 md:h-9 flex-shrink-0 flex items-center justify-center bg-cyan-500/10 rounded-lg md:rounded-xl border border-cyan-500/20">
                <svg className="w-4 md:w-5 h-4 md:h-5 text-cyan-500" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm md:text-lg tracking-tight text-white leading-tight truncate">Bantay Cam</h1>
                <div className="hidden sm:flex items-center gap-2 text-[8px] md:text-[9px] text-cyan-400 font-mono uppercase tracking-[0.2em]">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse flex-shrink-0"></span>
                  <span className="truncate">Active Monitoring</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {/* Mobile: Compact stats */}
              <div className="md:hidden flex items-center gap-3 pr-2 border-r border-slate-800">
                <div className="text-right">
                  <div className="text-[7px] uppercase text-slate-500 font-bold">Threats</div>
                  <div className={`text-xs font-mono ${stats.danger > 0 ? 'text-red-500' : 'text-slate-400'}`}>{stats.danger}</div>
                </div>
              </div>

              {/* Desktop: Full stats */}
              <div className="hidden md:flex items-center gap-3 pr-4 border-r border-slate-800">
                <div className="text-right">
                  <div className="text-[8px] uppercase text-slate-500 font-bold">Reliability</div>
                  <div className="text-xs font-mono text-cyan-400">{stats.avgConfidence}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] uppercase text-slate-500 font-bold">Threats</div>
                  <div className={`text-xs font-mono ${stats.danger > 0 ? 'text-red-500' : 'text-slate-400'}`}>{stats.danger}</div>
                </div>
                {smsSummary.smsEnabled && (
                  <div className="text-right">
                    <div className="text-[8px] uppercase text-slate-500 font-bold">SMS</div>
                    <div className="text-xs font-mono text-emerald-400">
                      On ({smsSummary.recipientCount})
                    </div>
                  </div>
                )}
              </div>

              {/* Settings button */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 rounded-lg flex-shrink-0"
                title="System settings"
              >
                <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Mode selector - Hidden on mobile, compact on tablet */}
              <div className="hidden sm:flex gap-1 p-1 bg-slate-950/50 border border-slate-800 rounded-lg flex-shrink-0">
                {(['NORMAL', 'LOW_LIGHT', 'THERMAL'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setCameraMode(CameraMode[m])}
                    className={`px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${
                      cameraMode === CameraMode[m] 
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {m === 'NORMAL' ? 'NOR' : m === 'LOW_LIGHT' ? 'LOW' : 'THM'}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setHasSession(false)}
                  className="hidden md:block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700 rounded-lg transition-all"
                  title="Return to login"
                >
                  Sign out
                </button>
                <button 
                  onClick={exportLogs}
                  className="p-2 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                  title="Export Logs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>

                {/* Mobile: Toggle log visibility */}
                <button
                  onClick={() => setIsMobileLogOpen(!isMobileLogOpen)}
                  className="md:hidden p-2 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                  title="Toggle logs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
                
                {/* Scan button */}
                <button
                  onClick={toggleScanning}
                  className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all border flex-shrink-0 ${
                    isScanning 
                      ? 'bg-red-500/10 text-red-500 border-red-500/50 animate-pulse' 
                      : 'bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-500 shadow-xl shadow-cyan-900/20'
                  }`}
                >
                  {isScanning ? 'STOP' : 'START'}
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-2 md:p-6 relative bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden">
            {activeThreat && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[40] bg-red-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-full font-bold shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-bounce flex items-center gap-2 md:gap-4 text-[10px] md:text-sm max-w-[90%]">
                <svg className="w-4 md:w-5 h-4 md:h-5 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="truncate">THREAT DETECTED</span>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[40] flex items-center gap-2 md:gap-3 bg-cyan-950/40 border border-cyan-500/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-md">
                <div className="flex gap-1">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-cyan-400 animate-bounce"></div>
                </div>
                <span className="text-[9px] md:text-[10px] font-mono text-cyan-400 uppercase tracking-widest whitespace-nowrap">AI</span>
              </div>
            )}
            
            {!isHardwareLoading ? renderCameraGrid() : (
              <div className="w-full h-full flex items-center justify-center">
                 <div className="w-8 md:w-10 h-8 md:h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            )}
          </main>

          <div className="hidden md:block shrink-0">
            <SensorPanel data={sensorData} />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:block shrink-0 shadow-2xl">
          <LiveLog 
            logs={logs} 
            recordings={recordings}
            onDeleteRecording={handleDeleteRecording}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearLogs}
          />
        </div>

        {/* Mobile log drawer */}
        {isMobileLogOpen && (
          <div className="md:hidden fixed inset-0 z-[70]">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileLogOpen(false)}
            />
            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-slate-950 border-l border-slate-800 shadow-2xl animate-in slide-in-from-right-8 duration-200 flex flex-col">
              <div className="h-14 px-3 flex items-center justify-between border-b border-slate-800 bg-slate-900/40 shrink-0">
                <div className="text-sm font-bold text-white">Security Logs</div>
                <button
                  type="button"
                  onClick={() => setIsMobileLogOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <LiveLog 
                  logs={logs} 
                  recordings={recordings}
                  onDeleteRecording={handleDeleteRecording}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onClear={clearLogs}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings drawer */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl animate-in slide-in-from-right-8 duration-200 flex flex-col">
            <div className="h-14 md:h-16 px-3 md:px-6 flex items-center justify-between border-b border-slate-800 bg-slate-900/40 shrink-0">
              <div>
                <div className="text-[8px] text-slate-500 font-mono uppercase tracking-[0.2em]">System</div>
                <div className="text-sm font-bold text-white leading-tight">Settings</div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 rounded-lg"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SettingsView
                scanInterval={scanInterval}
                onIntervalChange={setScanInterval}
                stats={stats}
                smsConfig={smsConfig}
                smsTestStatus={smsTestStatus}
                onSetSmsEnabled={setSmsEnabled}
                onAddRecipient={addSmsRecipient}
                onRemoveRecipient={removeSmsRecipient}
                onSetDangerCooldown={setDangerSmsCooldown}
                onSetCautionCooldown={setCautionSmsCooldown}
                onSendTestMessage={sendSmsTestMessage}
              />
            </div>
          </div>
        </div>
      )}

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
