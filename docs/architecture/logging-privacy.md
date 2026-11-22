# Structured Logging & Privacy Contract

## 1. Principles

1. **Zero Diagnostic Leakage of Sensitive Data**:
   URLs, user emails, authorization tokens, passwords, session cookies, raw error payloads, or arbitrary user input must **never** be logged into device storage, diagnostic ring buffers, or remote error trackers.

2. **Allowlisted Projection Architecture**:
   Only predefined, registered module names and fixed event strings retain structured metadata. Unknown events are collapsed into `app` / `event_redacted` with no context.

3. **Finite Context Types**:
   Context values are strictly limited to:
   - Finite numeric values (`status`, `resultCount`, `retryCount`).
   - Allowlisted uppercase HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`).
   - Normalized network error codes (`ERR_NETWORK`, `ERR_BAD_REQUEST`, `ERR_BAD_RESPONSE`, `ERR_CANCELED`, `ERR_UNKNOWN`, `ECONNABORTED`, `ETIMEDOUT`, or `ERR_OTHER`).
   - Safe booleans.

4. **Bounded In-Memory Retention**:
   The logger retains a maximum of 200 FIFO records in memory. This provides immediate diagnostic context for user bug reporting without accumulating unbounded memory or disk footprints.

---

## 2. API Contract & Usage

```typescript
import { structuredLogger } from '@shared/utils';

// Emitting safe diagnostic events
structuredLogger.debug('api.client', 'request', { method: 'GET' });
structuredLogger.info('storage.boundary', 'write_success', { status: 200, resultCount: 5 });
structuredLogger.error('api.client', 'request_failed', { code: 'ERR_NETWORK', status: 503 });

// Retrieving diagnostic snapshot (e.g. for feedback submission)
const logs = structuredLogger.snapshot();
```

---

## 3. Allowed vs. Rejected Patterns

| Scenario | ❌ Forbidden (Data Leak) | ✅ Approved (Privacy Safe) |
| :--- | :--- | :--- |
| API Request | `logger.debug(req.url, req.params)` | `structuredLogger.debug('api.client', 'request', { method: req.method })` |
| Network Error | `logger.error(error.message, error.stack)` | `structuredLogger.error('api.client', 'request_failed', { code: error.code, status: error.status })` |
| User Action | `logger.info("User clicked: " + user.email)` | `structuredLogger.info('auth.session', 'sign_in_attempt')` |
