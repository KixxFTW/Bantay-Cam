
import React from 'react';
import { CameraMode, DeviceId, CameraSource, SensorData, LogEntry, SecurityStatus } from '../types';
import CameraFeed from './CameraFeed';

interface MonitorViewProps {
  cameraMode: CameraMode;
  isScanning: boolean;
  setIsScanning: (s: boolean) => void;
  sensorData: SensorData;
  primaryCameraId: DeviceId | null;
  cameraSources: CameraSource[];
  setPrimaryCameraId: (id: DeviceId) => void;
  onFrame: (base64: string) => void;
  isAnalyzing: boolean;
  latestResult?: LogEntry;
  activeThreat: boolean;
  handleConnectionLost: (label: string) => void;
  handleCameraTerminalError: (id: DeviceId) => void;
}

const MonitorView: React.FC<MonitorViewProps> = ({
  cameraMode,
  isScanning,
  sensorData,
  primaryCameraId,
  cameraSources,
  setPrimaryCameraId,
  onFrame,
  isAnalyzing,
  activeThreat,
  handleConnectionLost,
  handleCameraTerminalError
}) => {
  const slots = [0, 1, 2, 3];

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-6 p-6">
      {slots.map((index) => {
        const cam = cameraSources[index];
        if (cam) {
          return (
            <CameraFeed 
              key={cam.id}
              deviceId={cam.id}
              cameraLabel={cam.label}
              mode={cameraMode} 
              onFrameCapture={onFrame} 
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
            <div className="relative z-10 flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 mb-4 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/50">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Slot {index + 1}</div>
              <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                Waiting for input...
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonitorView;
