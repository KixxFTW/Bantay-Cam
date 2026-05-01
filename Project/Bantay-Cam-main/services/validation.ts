import { z } from 'zod';
import { SecurityStatus, AnalysisResult, LogEntry, LogId } from '../types';

/**
 * Zod Schemas for Runtime Validation
 */
export const SecurityStatusSchema = z.nativeEnum(SecurityStatus);

export const AnalysisResultSchema = z.object({
  status: SecurityStatusSchema,
  hazards: z.array(z.string()),
  action: z.string(),
  confidence: z.number().min(0).max(100),
  timestamp: z.string(),
  error: z.string().optional(),
});

export const LogEntrySchema = AnalysisResultSchema.extend({
  id: z.string().transform((val) => val as LogId),
});

/**
 * Type Guards
 */
export function isSecurityStatus(val: unknown): val is SecurityStatus {
  return SecurityStatusSchema.safeParse(val).success;
}

export function isAnalysisResult(val: unknown): val is AnalysisResult {
  return AnalysisResultSchema.safeParse(val).success;
}

export function isLogEntry(val: unknown): val is LogEntry {
  return LogEntrySchema.safeParse(val).success;
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
