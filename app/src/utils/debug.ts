/**
 * Debug utility for conditional logging based on debug mode setting
 */

export interface DebugLogger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  table: (data: any) => void;
}

export const createDebugLogger = (enabled: boolean): DebugLogger => ({
  log: (...args: any[]) => enabled && console.log('[DEBUG]', ...args),
  warn: (...args: any[]) => enabled && console.warn('[DEBUG WARN]', ...args),
  error: (...args: any[]) => enabled && console.error('[DEBUG ERROR]', ...args),
  table: (data: any) => enabled && console.table(data),
});
