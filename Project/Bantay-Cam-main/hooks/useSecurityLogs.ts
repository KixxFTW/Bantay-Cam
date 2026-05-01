
import { useState, useMemo, useCallback } from 'react';
import { LogEntry, SecurityStatus } from '../types';

export const useSecurityLogs = (maxEntries: number = 50) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const addLog = useCallback((entry: LogEntry) => {
    setLogs(prev => [entry, ...prev].slice(0, maxEntries));
  }, [maxEntries]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const lowerQuery = searchQuery.toLowerCase();
    return logs.filter(log => 
      log.status.toLowerCase().includes(lowerQuery) || 
      log.hazards.some(h => h.toLowerCase().includes(lowerQuery)) ||
      log.action.toLowerCase().includes(lowerQuery)
    );
  }, [logs, searchQuery]);

  const stats = useMemo(() => ({
    total: logs.length,
    danger: logs.filter(l => l.status === SecurityStatus.DANGER).length,
    caution: logs.filter(l => l.status === SecurityStatus.CAUTION).length,
    safe: logs.filter(l => l.status === SecurityStatus.SAFE).length,
    avgConfidence: logs.length > 0 
      ? Math.round(logs.reduce((acc, curr) => acc + curr.confidence, 0) / logs.length) 
      : 0
  }), [logs]);

  const exportLogs = useCallback(() => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bantay-cam-forensics-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  return {
    logs: filteredLogs,
    allLogs: logs,
    addLog,
    stats,
    searchQuery,
    setSearchQuery,
    exportLogs,
    clearLogs: () => setLogs([])
  };
};
