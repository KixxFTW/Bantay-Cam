import { useState, useEffect, useCallback } from 'react';
import { CameraSource, ErrorType, ErrorSeverity, DeviceId, asDeviceId } from '../types';
import { errorService } from '../services/errorService';

export const useCameraDevices = () => {
  const [cameraSources, setCameraSources] = useState<CameraSource[]>([]);
  const [primaryCameraId, setPrimaryCameraId] = useState<DeviceId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Probing for permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      const sources: CameraSource[] = videoDevices.map((device, index) => ({
        id: asDeviceId(device.deviceId),
        label: device.label || `Camera ${index + 1}`,
      }));

      setCameraSources(sources);
      if (sources.length > 0 && !primaryCameraId) {
        setPrimaryCameraId(sources[0].id);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown hardware error";
      errorService.log({
        type: ErrorType.CAMERA,
        severity: ErrorSeverity.HIGH,
        message: "Camera discovery failed",
        actionRequired: "Check browser permissions",
        context: { err: message }
      });
    } finally {
      setIsLoading(false);
    }
  }, [primaryCameraId]);

  useEffect(() => {
    refreshDevices();

    const handleDeviceChange = () => {
      refreshDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [refreshDevices]);

  return {
    cameraSources,
    primaryCameraId,
    setPrimaryCameraId,
    isLoading,
    refreshDevices
  };
};