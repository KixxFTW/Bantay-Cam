import { SafeTrackError, ErrorType, ErrorSeverity } from '../types';

class ErrorService {
  private static instance: ErrorService;
  private logs: SafeTrackError[] = [];
  private readonly STORAGE_KEY = 'bantay_cam_error_logs';

  private constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.logs = JSON.parse(saved).slice(-100); // Keep last 100
      } catch (e) {
        this.logs = [];
      }
    }
  }

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public log(params: Omit<SafeTrackError, 'id' | 'timestamp'>): SafeTrackError {
    // Polyfill for crypto.randomUUID if not available
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Fallback: simple UUID v4 implementation
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const id = generateId();
    const error: SafeTrackError = {
      ...params,
      id,
      timestamp: new Date().toISOString(),
    };

    console.error(`[${error.type}] ${error.severity}: ${error.message}`, error.context);
    
    this.logs.push(error);
    this.persist();
    return error;
  }

  private persist() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
  }

  public getLogs(): SafeTrackError[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const errorService = ErrorService.getInstance();
