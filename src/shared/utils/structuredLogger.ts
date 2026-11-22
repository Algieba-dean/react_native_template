export type StructuredLogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export interface StructuredLogRecord {
  timestamp: string;
  level: StructuredLogLevel;
  module: string;
  message: string;
  context?: Record<string, string | number | boolean>;
}

/**
 * Allowlisted event registry.
 * Only registered module names and fixed event strings are permitted to retain context.
 * Dynamic strings, raw URLs, user emails, tokens, or arbitrary error messages are never logged.
 */
const EVENTS: Record<string, readonly string[]> = {
  'api.client': ['request', 'request_rejected', 'response', 'request_failed'],
  'app.lifecycle': ['bootstrap', 'ready', 'background', 'foreground', 'error_boundary'],
  'storage.boundary': [
    'read_success',
    'read_failed',
    'write_success',
    'write_failed',
    'candidate_staged',
    'candidate_committed',
  ],
  'auth.session': ['sign_in_attempt', 'sign_in_success', 'sign_in_failed', 'sign_out'],
};

const METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'UNKNOWN']);
const ERROR_CODES = new Set([
  'ERR_NETWORK',
  'ERR_BAD_REQUEST',
  'ERR_BAD_RESPONSE',
  'ERR_CANCELED',
  'ERR_UNKNOWN',
  'ECONNABORTED',
  'ETIMEDOUT',
]);
const MAX_RECORDS = 200;

/** Arbitrary strings are not safe diagnostic fields. */
export function redactStructuredValue(value: unknown): string | number | boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return '[redacted]';
}

export function createStructuredLogRecord(
  level: StructuredLogLevel,
  module: string,
  message: string,
  context?: Record<string, unknown>,
): StructuredLogRecord {
  const registered = Object.prototype.hasOwnProperty.call(EVENTS, module);
  const safeModule = registered ? module : 'app';
  const safeMessage = registered && EVENTS[module].includes(message) ? message : 'event_redacted';
  const safeContext: Record<string, string | number | boolean> = {};

  if (registered && safeMessage !== 'event_redacted' && context) {
    for (const [key, value] of Object.entries(context)) {
      if (
        (key === 'status' || key === 'resultCount' || key === 'retryCount') &&
        typeof value === 'number' &&
        Number.isFinite(value)
      ) {
        safeContext[key] = value;
      } else if (
        key === 'method' &&
        typeof value === 'string' &&
        METHODS.has(value.toUpperCase())
      ) {
        safeContext[key] = value.toUpperCase();
      } else if (key === 'code' && typeof value === 'string') {
        safeContext[key] = ERROR_CODES.has(value) ? value : 'ERR_OTHER';
      } else if (key === 'success' && typeof value === 'boolean') {
        safeContext[key] = value;
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    level,
    module: safeModule,
    message: safeMessage,
    ...(Object.keys(safeContext).length ? { context: safeContext } : {}),
  };
}

export class StructuredLogger {
  private records: StructuredLogRecord[] = [];

  write(
    level: StructuredLogLevel,
    module: string,
    message: string,
    context?: Record<string, unknown>,
  ): StructuredLogRecord {
    const record = createStructuredLogRecord(level, module, message, context);
    this.records = [...this.records, record].slice(-MAX_RECORDS);
    return record;
  }

  debug(module: string, message: string, context?: Record<string, unknown>): StructuredLogRecord {
    return this.write('DEBUG', module, message, context);
  }

  info(module: string, message: string, context?: Record<string, unknown>): StructuredLogRecord {
    return this.write('INFO', module, message, context);
  }

  warning(module: string, message: string, context?: Record<string, unknown>): StructuredLogRecord {
    return this.write('WARNING', module, message, context);
  }

  error(module: string, message: string, context?: Record<string, unknown>): StructuredLogRecord {
    return this.write('ERROR', module, message, context);
  }

  snapshot(): StructuredLogRecord[] {
    return this.records.slice();
  }

  clear(): void {
    this.records = [];
  }
}

export const structuredLogger = new StructuredLogger();
