import { createStructuredLogRecord, structuredLogger } from '../shared/utils/structuredLogger';

describe('structuredLogger', () => {
  beforeEach(() => {
    structuredLogger.clear();
  });

  it('retains registered safe fields and rejects sensitive paths, secrets and free text', () => {
    const record = createStructuredLogRecord('ERROR', 'api.client', 'request_failed', {
      token: 'bearer-super-secret-token',
      path: '/users/alice@example.com',
      status: 500,
      detail: 'Bearer private-key',
      code: 'ECONNABORTED',
    });

    expect(record.context).toEqual({ status: 500, code: 'ECONNABORTED' });
    expect(JSON.stringify(record)).not.toMatch(/alice|bearer|secret|private/);

    const arbitrary = createStructuredLogRecord('ERROR', 'user@example.com', 'password=123456', {
      status: 500,
    });
    expect(arbitrary).toMatchObject({ module: 'app', message: 'event_redacted' });
    expect(JSON.stringify(arbitrary)).not.toMatch(/user@example|password/);
  });

  it('maps unknown error codes to ERR_OTHER', () => {
    const record = createStructuredLogRecord('ERROR', 'api.client', 'request_failed', {
      code: 'RANDOM_CUSTOM_ERROR_CODE',
      status: 502,
    });
    expect(record.context).toEqual({ code: 'ERR_OTHER', status: 502 });
  });

  it('enforces maximum 200 records buffer limit and preserves FIFO order', () => {
    for (let i = 0; i < 250; i++) {
      structuredLogger.info('storage.boundary', 'write_success', {
        status: 200,
        resultCount: i,
      });
    }

    const snapshot = structuredLogger.snapshot();
    expect(snapshot).toHaveLength(200);
    // Oldest 50 records should have been evicted; first record has resultCount = 50
    expect(snapshot[0].context?.resultCount).toBe(50);
    // Newest record has resultCount = 249
    expect(snapshot[199].context?.resultCount).toBe(249);
  });
});
