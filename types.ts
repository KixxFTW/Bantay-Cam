declare module "*.png";
/**
 * SafeTrack Nominal/Branded Types
 */
declare const brand: unique symbol;
export type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type DeviceId = Brand<string, 'DeviceId'>;
export type LogId = Brand<string, 'LogId'>;

/**
 * Common Enums
 */
export enum SecurityStatus {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  DANGER = 'DANGER',
}

export enum CameraMode {
  NORMAL = 'NORMAL',
  LOW_LIGHT = 'LOW_LIGHT',
  THERMAL = 'THERMAL',
}

export enum ErrorType {
  CAMERA = 'CAMERA',
  NETWORK = 'NETWORK',
  AI = 'AI',
  SYSTEM = 'SYSTEM',
  SENSOR = 'SENSOR',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export type AppTab = 'monitor' | 'logs' | 'settings';

/**
 * Data Interfaces
 */
export interface AnalysisResult {
  readonly status: SecurityStatus;
  readonly hazards: readonly string[];
  readonly action: string;
  readonly confidence: number;
  readonly timestamp: string;
  readonly error?: string;
}

export interface SensorData {
  readonly audioLevel: number; // dB
  readonly motionDetected: boolean;
  readonly temperature: number; // Celsius
  readonly humidity: number; // %
}

export interface LogEntry extends AnalysisResult {
  readonly id: LogId;
}

export interface CameraSource {
  readonly id: DeviceId;
  readonly label: string;
}

export interface SafeTrackError {
  readonly id: string;
  readonly timestamp: string;
  readonly type: ErrorType;
  readonly severity: ErrorSeverity;
  readonly message: string;
  readonly context?: Record<string, any>;
  readonly actionRequired?: string;
}

/**
 * Utility Types
 */
export const asDeviceId = (id: string): DeviceId => id as DeviceId;
export const asLogId = (id: string): LogId => id as LogId;
