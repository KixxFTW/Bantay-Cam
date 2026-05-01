import { useState, useCallback, useRef } from 'react';
import { analyzeFrame } from '../services/geminiService';
import { SensorData, SecurityStatus, LogEntry, asLogId } from '../types';

interface UseFrameAnalysisProps {
  onAnalysisComplete: (result: LogEntry) => void;
  rateLimitMs?: number;
}

export const useFrameAnalysis = ({ onAnalysisComplete, rateLimitMs = 3000 }: UseFrameAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastAnalysisTime = useRef<number>(0);

  const processFrame = useCallback(async (base64Image: string, sensorData: SensorData | null) => {
    const now = Date.now();
    if (now - lastAnalysisTime.current < rateLimitMs || isAnalyzing) return;
    
    lastAnalysisTime.current = now;
    setIsAnalyzing(true);

    const contextStr = sensorData 
      ? `Audio: ${sensorData.audioLevel.toFixed(1)}dB, Motion: ${sensorData.motionDetected}, Temp: ${sensorData.temperature.toFixed(1)}C`
      : "No sensors active";
    
    try {
      const result = await analyzeFrame(base64Image, contextStr);
      
      const isMotion = sensorData?.motionDetected ?? false;
      const isThreat = result.status !== SecurityStatus.SAFE;

      if (isMotion || isThreat) {
        // Fix: Cast the random UUID string to the branded LogId type using the asLogId helper to satisfy type safety requirements.
        onAnalysisComplete({
          ...result,
          id: asLogId(crypto.randomUUID()),
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, onAnalysisComplete, rateLimitMs]);

  return { processFrame, isAnalyzing };
};