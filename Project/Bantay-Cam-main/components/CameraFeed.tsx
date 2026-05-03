import React, { useRef, useEffect, useState } from 'react';
import { CameraMode, ErrorType, ErrorSeverity, DeviceId } from '../types';
import { errorService } from '../services/errorService';

interface CameraFeedProps {
  mode: CameraMode;
  onFrameCapture: (base64: string) => void;
  recordTriggerToken?: number;
  onRecordingReady?: (payload: { url: string; sourceLabel: string; recordingType: 'session' | 'threat-clip'; reason?: string }) => void;
  onConnectionLost?: (label: string) => void;
  onTerminalError?: (id: DeviceId) => void;
  onError?: (msg: string) => void;
  isScanning: boolean;
  deviceId: DeviceId;
  isPrimary: boolean;
  onClick: () => void;
  cameraLabel: string;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ 
  mode, 
  onFrameCapture, 
  recordTriggerToken = 0,
  onRecordingReady,
  onConnectionLost,
  onTerminalError,
  onError,
  isScanning, 
  deviceId, 
  isPrimary, 
  onClick, 
  cameraLabel 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const threatRecorderRef = useRef<MediaRecorder | null>(null);
  const sessionRecorderRef = useRef<MediaRecorder | null>(null);
  const prebufferRecorderRef = useRef<MediaRecorder | null>(null);
  const threatChunksRef = useRef<BlobPart[]>([]);
  const sessionChunksRef = useRef<BlobPart[]>([]);
  const prebufferWindowRef = useRef<Array<{ t: number; data: Blob }>>([]);
  const stopThreatTimeoutRef = useRef<number | null>(null);
  const stopSessionTimeoutRef = useRef<number | null>(null);
  const lastHandledRecordTokenRef = useRef(0);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSessionRecording, setIsSessionRecording] = useState(false);

  const RECORD_TIMESLICE_MS = 1000;
  const THREAT_CLIP_MS = 12_000;
  const PREBUFFER_MS = 5_000;

  const stopRecorderSafe = (recorder: MediaRecorder | null) => {
    try {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let isCancelled = false;
    const startCamera = async () => {
      if (!deviceId) return;

      try {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            deviceId: { exact: deviceId },
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          } 
        });
        
        if (!isCancelled && videoRef.current) {
          streamRef.current = stream;
          stream.getVideoTracks().forEach(track => {
            track.onended = () => {
              const msg = "HARDWARE DISCONNECTED";
              setStreamError(msg);
              onConnectionLost?.(cameraLabel);
              onTerminalError?.(deviceId);
              errorService.log({
                type: ErrorType.CAMERA,
                severity: ErrorSeverity.HIGH,
                message: `${cameraLabel}: Physical connection severed`,
                context: { deviceId }
              });
            };
          });

          videoRef.current.srcObject = stream;
          setStreamError(null);
        }
      } catch (err: unknown) {
        let userMessage = "CAMERA ACCESS FAILED";
        let severity = ErrorSeverity.MEDIUM;

        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            userMessage = "PERMISSION DENIED";
            severity = ErrorSeverity.HIGH;
          } else if (err.name === 'NotReadableError') {
            userMessage = "DEVICE IN USE BY ANOTHER APP";
          } else if (err.name === 'OverconstrainedError') {
            userMessage = "HARDWARE LIMITATION";
          }
        }

        if (!isCancelled) {
          setStreamError(userMessage);
          onError?.(userMessage);
          onTerminalError?.(deviceId);
          errorService.log({
            type: ErrorType.CAMERA,
            severity,
            message: `${cameraLabel}: ${userMessage}`,
            context: { error: err, deviceId }
          });
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (stopThreatTimeoutRef.current) clearTimeout(stopThreatTimeoutRef.current);
      if (stopSessionTimeoutRef.current) clearTimeout(stopSessionTimeoutRef.current);

      stopRecorderSafe(threatRecorderRef.current);
      stopRecorderSafe(prebufferRecorderRef.current);
      stopRecorderSafe(sessionRecorderRef.current);

      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      streamRef.current = null;
    };
  }, [deviceId, cameraLabel, onTerminalError, onConnectionLost, onError]);

  useEffect(() => {
    let intervalId: number | undefined;
    const capture = () => {
      try {
        if (videoRef.current?.readyState === 4 && canvasRef.current && !streamError) {
          const context = canvasRef.current.getContext('2d');
          if (context) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const base64 = canvasRef.current.toDataURL('image/jpeg', 0.9).split(',')[1];
            onFrameCapture(base64);
          }
        }
      } catch (err) {
        console.error("Frame capture error", err);
      }
    };

    if (isScanning && isPrimary && !streamError) {
      capture();
      intervalId = window.setInterval(capture, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScanning, isPrimary, streamError, onFrameCapture]);

  useEffect(() => {
    if (!isPrimary || streamError) return;
    if (!streamRef.current || typeof MediaRecorder === 'undefined') return;

    const shouldRecord = isScanning;
    if (!shouldRecord) {
      stopRecorderSafe(prebufferRecorderRef.current);
      stopRecorderSafe(sessionRecorderRef.current);
      return;
    }

    // Start continuous session recording (full-session clip)
    if (!sessionRecorderRef.current || sessionRecorderRef.current.state === 'inactive') {
      try {
        const sessionStream = streamRef.current.clone();
        const recorder = new MediaRecorder(sessionStream, { mimeType: 'video/webm' });
        sessionRecorderRef.current = recorder;
        sessionChunksRef.current = [];

        recorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) sessionChunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          setIsSessionRecording(false);
          try {
            sessionStream.getTracks().forEach((t) => t.stop());
          } catch {
            // ignore
          }
          if (sessionChunksRef.current.length === 0) return;
          const blob = new Blob(sessionChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          onRecordingReady?.({ url, sourceLabel: cameraLabel, recordingType: 'session', reason: 'Full scanning session' });
          sessionChunksRef.current = [];
        };

        recorder.start(RECORD_TIMESLICE_MS);
        setIsSessionRecording(true);
      } catch (error) {
        errorService.log({
          type: ErrorType.CAMERA,
          severity: ErrorSeverity.MEDIUM,
          message: `${cameraLabel}: Session recording initialization failed`,
          context: { error }
        });
      }
    }

    // Start pre-buffer recording (rolling window for threat clips)
    if (!prebufferRecorderRef.current || prebufferRecorderRef.current.state === 'inactive') {
      try {
        const preStream = streamRef.current.clone();
        const recorder = new MediaRecorder(preStream, { mimeType: 'video/webm' });
        prebufferRecorderRef.current = recorder;
        prebufferWindowRef.current = [];

        recorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size <= 0) return;
          const now = Date.now();
          const blob = event.data;
          prebufferWindowRef.current.push({ t: now, data: blob });
          const cutoff = now - PREBUFFER_MS;
          while (prebufferWindowRef.current.length > 0 && prebufferWindowRef.current[0]!.t < cutoff) {
            prebufferWindowRef.current.shift();
          }
        };

        recorder.onstop = () => {
          try {
            preStream.getTracks().forEach((t) => t.stop());
          } catch {
            // ignore
          }
        };

        recorder.start(RECORD_TIMESLICE_MS);
      } catch (error) {
        errorService.log({
          type: ErrorType.CAMERA,
          severity: ErrorSeverity.LOW,
          message: `${cameraLabel}: Prebuffer recording initialization failed`,
          context: { error }
        });
      }
    }
  }, [isScanning, isPrimary, streamError, onRecordingReady, cameraLabel]);

  useEffect(() => {
    if (recordTriggerToken <= 0 || !isPrimary || streamError) return;
    if (recordTriggerToken === lastHandledRecordTokenRef.current) return;
    if (!streamRef.current || typeof MediaRecorder === 'undefined') return;
    if (threatRecorderRef.current && threatRecorderRef.current.state !== 'inactive') return;

    lastHandledRecordTokenRef.current = recordTriggerToken;

    try {
      const threatStream = streamRef.current.clone();
      const recorder = new MediaRecorder(threatStream, { mimeType: 'video/webm' });
      threatRecorderRef.current = recorder;
      threatChunksRef.current = [];

      // Seed with pre-buffer window (capture the seconds BEFORE detection).
      const pre = prebufferWindowRef.current.map((x) => x.data);
      threatChunksRef.current.push(...pre);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) threatChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        setIsRecording(false);
        try {
          threatStream.getTracks().forEach((t) => t.stop());
        } catch {
          // ignore
        }
        if (threatChunksRef.current.length === 0) return;
        const blob = new Blob(threatChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onRecordingReady?.({ url, sourceLabel: cameraLabel, recordingType: 'threat-clip' });
        threatChunksRef.current = [];
      };

      recorder.start(RECORD_TIMESLICE_MS);
      setIsRecording(true);
      stopThreatTimeoutRef.current = window.setTimeout(() => {
        stopRecorderSafe(recorder);
      }, THREAT_CLIP_MS);
    } catch (error) {
      errorService.log({
        type: ErrorType.CAMERA,
        severity: ErrorSeverity.MEDIUM,
        message: `${cameraLabel}: Threat recording initialization failed`,
        context: { error }
      });
    }

    return () => {
      if (stopThreatTimeoutRef.current) clearTimeout(stopThreatTimeoutRef.current);
    };
  }, [recordTriggerToken, isPrimary, streamError, onRecordingReady, cameraLabel]);

  const getFilterStyle = () => {
    switch (mode) {
      case CameraMode.LOW_LIGHT: return "grayscale(100%) contrast(140%) brightness(120%) sepia(30%)";
      case CameraMode.THERMAL: return "invert(100%) contrast(200%) hue-rotate(180deg) saturate(200%)";
      default: return "none";
    }
  };

  return (
    <div 
      className={`relative w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border-2 ${
        isPrimary ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-slate-800 cursor-pointer hover:border-slate-700'
      } ${streamError ? 'hidden' : 'block'}`}
      onClick={!isPrimary ? onClick : undefined}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ filter: getFilterStyle() }}
      />
      <div className="absolute top-2 left-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
          {cameraLabel}
      </div>
      <div className="absolute bottom-2 right-3 flex items-center space-x-1.5 bg-black/60 px-2 py-0.5 rounded">
        <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
        <span className="text-red-500 font-mono text-[9px] font-bold">LIVE</span>
      </div>
      {isRecording && (
        <div className="absolute top-2 right-3 flex items-center space-x-1.5 bg-red-950/80 border border-red-500/50 px-2 py-0.5 rounded">
          <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-red-300 font-mono text-[9px] font-bold">REC</span>
        </div>
      )}
      {isSessionRecording && !isRecording && (
        <div className="absolute top-2 right-3 flex items-center space-x-1.5 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded">
          <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-cyan-200 font-mono text-[9px] font-bold">SESSION</span>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraFeed;