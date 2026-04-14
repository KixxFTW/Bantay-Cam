
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
    const error: SafeTrackError = {
      ...params,
      id: crypto.randomUUID(),
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
