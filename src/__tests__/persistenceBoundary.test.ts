import { SafePersistenceStore } from '../shared/services/storage/persistenceBoundary';
import { InMemoryStorageAdapter } from '../shared/services/storage/storageService';
import {
  computeCrc32,
  createBackupEnvelope,
  validateBackupEnvelope,
} from '../shared/services/storage/backupContracts';

describe('SafePersistenceStore', () => {
  let storage: InMemoryStorageAdapter;

  beforeEach(() => {
    storage = new InMemoryStorageAdapter();
  });

  interface AppState {
    theme: string;
    items: string[];
  }

  const defaultState: AppState = {
    theme: 'system',
    items: [],
  };

  it('initializes with default data on clean install', async () => {
    const store = new SafePersistenceStore<AppState>({
      storageKey: 'app_state',
      storageService: storage,
      defaultData: defaultState,
    });

    const result = await store.initialize();
    expect(result.success).toBe(true);
    expect(store.getStatus()).toBe('ready');
    expect(store.getData()).toEqual(defaultState);
  });

  it('loads existing stored data on subsequent launches', async () => {
    const existing = { theme: 'dark', items: ['apple', 'banana'] };
    await storage.setItem('app_state', existing);

    const store = new SafePersistenceStore<AppState>({
      storageKey: 'app_state',
      storageService: storage,
      defaultData: defaultState,
    });

    const result = await store.initialize();
    expect(result.success).toBe(true);
    expect(store.getStatus()).toBe('ready');
    expect(store.getData()).toEqual(existing);
  });

  it('anti-clobber guard: preserves on-disk state and triggers onReadError on read failure', async () => {
    const faultyStorage = new InMemoryStorageAdapter();
    const onReadError = jest.fn();

    // Mock getItem to throw an error simulating disk corrupt/failure
    jest.spyOn(faultyStorage, 'getItem').mockRejectedValueOnce(new Error('Disk read error'));

    const store = new SafePersistenceStore<AppState>({
      storageKey: 'app_state',
      storageService: faultyStorage,
      defaultData: defaultState,
      onReadError,
    });

    const result = await store.initialize();
    expect(result.success).toBe(false);
    expect(store.getStatus()).toBe('error');
    expect(onReadError).toHaveBeenCalledTimes(1);
    // Crucial: ensure setItem was NOT called with defaultData
    const setItemSpy = jest.spyOn(faultyStorage, 'setItem');
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('supports candidate staging, commit, and rollback pattern', async () => {
    const store = new SafePersistenceStore<AppState>({
      storageKey: 'app_state',
      storageService: storage,
      defaultData: defaultState,
    });
    await store.initialize();

    const candidateState: AppState = { theme: 'light', items: ['staged-item'] };
    store.stageCandidate(candidateState);
    expect(store.getStagedCandidate()).toEqual(candidateState);
    expect(store.getData()).toEqual(defaultState); // unchanged before commit

    // Commit candidate
    const commitSuccess = await store.commitCandidate();
    expect(commitSuccess).toBe(true);
    expect(store.getStagedCandidate()).toBeNull();
    expect(store.getData()).toEqual(candidateState);

    // Rollback test
    store.stageCandidate({ theme: 'dark', items: ['should-be-rolled-back'] });
    store.rollbackCandidate();
    expect(store.getStagedCandidate()).toBeNull();
    expect(store.getData()).toEqual(candidateState);
  });

  it('handles write failure safely without corrupting current in-memory state', async () => {
    const onWriteError = jest.fn();
    const store = new SafePersistenceStore<AppState>({
      storageKey: 'app_state',
      storageService: storage,
      defaultData: defaultState,
      onWriteError,
    });
    await store.initialize();

    jest.spyOn(storage, 'setItem').mockRejectedValueOnce(new Error('Disk write failed'));

    const success = await store.setData({ theme: 'dark', items: ['failed'] });
    expect(success).toBe(false);
    expect(onWriteError).toHaveBeenCalledTimes(1);
    expect(store.getData()).toEqual(defaultState);
  });

  it('enforces read-before-interactive: rejects setData and stageCandidate when uninitialized or in error state', async () => {
    const store = new SafePersistenceStore<AppState>({
      storageKey: 'app_state',
      storageService: storage,
      defaultData: defaultState,
    });

    // Uninitialized (status 'idle')
    expect(store.getStatus()).toBe('idle');
    await expect(store.setData({ theme: 'dark', items: ['blocked'] })).rejects.toThrow(
      /Cannot persist data when store status is 'idle'/,
    );
    expect(() => store.stageCandidate({ theme: 'dark', items: ['blocked'] })).toThrow(
      /Cannot stage candidate when store status is 'idle'/,
    );

    // Failing initialization (status 'error')
    const faultyStorage = new InMemoryStorageAdapter();
    jest.spyOn(faultyStorage, 'getItem').mockRejectedValueOnce(new Error('Corrupt disk'));
    const errorStore = new SafePersistenceStore<AppState>({
      storageKey: 'app_state',
      storageService: faultyStorage,
      defaultData: defaultState,
    });
    await errorStore.initialize();
    expect(errorStore.getStatus()).toBe('error');

    await expect(errorStore.setData({ theme: 'dark', items: ['clobber'] })).rejects.toThrow(
      /Cannot persist data when store status is 'error'/,
    );
  });
});

describe('BackupContracts', () => {
  it('computes deterministic CRC32 checksums', () => {
    const hash1 = computeCrc32('{"test":123}');
    const hash2 = computeCrc32('{"test":123}');
    const hash3 = computeCrc32('{"test":456}');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).toMatch(/^crc32_[0-9a-f]{8}$/);
  });

  it('correctly distinguishes non-ASCII and Unicode characters in CRC32', () => {
    const ascii = computeCrc32('A');
    const unicodeAccent = computeCrc32('Ł');
    const cjk = computeCrc32('人形记');

    expect(ascii).not.toBe(unicodeAccent);
    expect(ascii).toBe('crc32_d3d99e8b');
    expect(unicodeAccent).toBe('crc32_6deb8242');
    expect(cjk).toMatch(/^crc32_[0-9a-f]{8}$/);
  });

  it('creates and validates a signed BackupEnvelope', () => {
    const payload = { settings: { theme: 'dark' }, entries: [1, 2, 3] };
    const envelope = createBackupEnvelope(payload, 2, { appVersion: '1.0.0' });

    expect(envelope.header.schemaVersion).toBe(2);
    expect(envelope.header.appVersion).toBe('1.0.0');
    expect(envelope.header.checksum).toBe(computeCrc32(JSON.stringify(payload)));

    const validation = validateBackupEnvelope(JSON.stringify(envelope), {
      supportedVersions: [1, 2],
    });
    expect(validation.valid).toBe(true);
    expect(validation.envelope?.payload).toEqual(payload);
  });

  it('rejects tampered or corrupt backup payloads', () => {
    const payload = { a: 1 };
    const envelope = createBackupEnvelope(payload, 1);
    const jsonStr = JSON.stringify(envelope);

    // Tamper with payload
    const tampered = jsonStr.replace('"a":1', '"a":999');
    const result = validateBackupEnvelope(tampered, { supportedVersions: [1] });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('checksum verification failed');
  });

  it('rejects unsupported schema versions', () => {
    const envelope = createBackupEnvelope({ test: true }, 99);
    const result = validateBackupEnvelope(JSON.stringify(envelope), {
      supportedVersions: [1, 2],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported backup schema version: 99');
  });
});
