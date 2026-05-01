import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorService } from '../services/errorService';
import { ErrorType, ErrorSeverity } from '../types';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fix: Explicitly extending React.Component ensures that the TypeScript compiler 
// correctly identifies inherited members like 'props' and 'state', resolving potential 
// inference failures in certain build environments.
class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Explicitly defining state as a class property for robust type resolution.
  public state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorService.log({
      type: ErrorType.SYSTEM,
      severity: ErrorSeverity.CRITICAL,
      message: error.message,
      context: { errorInfo },
      actionRequired: "Reload the application"
    });
  }

  public render() {
    // Fix: Accessing this.state and this.props from the correctly inherited React.Component base.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-200">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold font-mono text-white mb-2">SYSTEM CRITICAL FAILURE</h1>
              <p className="text-sm text-slate-400 mb-6">
                An unexpected error occurred in the UI kernel. Error logs have been captured for diagnosis.
              </p>
              <div className="w-full bg-black/50 rounded-lg p-3 mb-6 font-mono text-[10px] text-red-400 text-left overflow-auto max-h-32">
                {this.state.error?.toString()}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-red-900/20"
              >
                REBOOT SYSTEM
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Fix: Explicitly returning this.props.children, now correctly typed through React.Component.
    return this.props.children;
  }
}

export default ErrorBoundary;