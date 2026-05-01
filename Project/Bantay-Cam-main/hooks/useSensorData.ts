
import { useState, useEffect, useCallback } from 'react';
import { SensorData } from '../types';

export const useSensorData = (updateInterval: number = 2000) => {
  const [sensorData, setSensorData] = useState<SensorData>({
    audioLevel: 42,
    motionDetected: false,
    temperature: 24.5,
    humidity: 52
  });

  const validateData = useCallback((data: SensorData): boolean => {
    return (
      data.audioLevel >= 0 &&
      data.temperature > -10 && data.temperature < 50 &&
      data.humidity >= 0 && data.humidity <= 100
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => {
        // Simulating environmental fluctuations
        const audioVariance = (Math.random() * 12 - 6);
        const next: SensorData = {
          audioLevel: Math.max(30, Math.min(110, prev.audioLevel + audioVariance)),
          temperature: Math.max(20, Math.min(35, prev.temperature + (Math.random() * 0.4 - 0.2))),
          humidity: Math.max(45, Math.min(65, prev.humidity + (Math.random() * 1 - 0.5))),
          motionDetected: Math.random() > 0.82 // Simulating PIR sensor trigger
        };
        return validateData(next) ? next : prev;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval, validateData]);

  return { sensorData };
};
