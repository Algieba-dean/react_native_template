import {
  storageService,
  InMemoryStorageAdapter,
  AsyncStorageAdapter,
  createStorageService,
  IStorageBackend,
} from '../shared/services/storage/storageService';

describe('StorageService & Adapters', () => {
  beforeEach(async () => {
    await storageService.clear();
  });

  it('should store and retrieve string items', async () => {
    await storageService.setItem('test_key', 'hello_world');
    const value = await storageService.getItem<string>('test_key');
    expect(value).toBe('hello_world');
  });

  it('should store and retrieve complex object items', async () => {
    const user = { id: 123, name: 'Alice', active: true };
    await storageService.setItem('user_profile', user);
    const retrieved = await storageService.getItem<typeof user>('user_profile');
    expect(retrieved).toEqual(user);
  });

  it('should return null for non-existent keys', async () => {
    const value = await storageService.getItem('non_existent_key');
    expect(value).toBeNull();
  });

  it('should remove items correctly', async () => {
    await storageService.setItem('to_delete', 'value');
    await storageService.removeItem('to_delete');
    const value = await storageService.getItem('to_delete');
    expect(value).toBeNull();
  });

  it('should clear all items', async () => {
    await storageService.setItem('key1', 'val1');
    await storageService.setItem('key2', 'val2');
    await storageService.clear();
    expect(await storageService.getItem('key1')).toBeNull();
    expect(await storageService.getItem('key2')).toBeNull();
  });

  it('identifies in-memory adapter as non-persistent', () => {
    const memory = new InMemoryStorageAdapter();
    expect(memory.isPersistent).toBe(false);
  });

  it('AsyncStorageAdapter correctly delegates to backing store and marks persistent', async () => {
    const mockMap = new Map<string, string>();
    const mockBackend: IStorageBackend = {
      getItem: jest.fn(async (key: string) => mockMap.get(key) ?? null),
      setItem: jest.fn(async (key: string, val: string) => {
        mockMap.set(key, val);
      }),
      removeItem: jest.fn(async (key: string) => {
        mockMap.delete(key);
      }),
      clear: jest.fn(async () => {
        mockMap.clear();
      }),
      getAllKeys: jest.fn(async () => Array.from(mockMap.keys())),
    };

    const persistent = new AsyncStorageAdapter(mockBackend);
    expect(persistent.isPersistent).toBe(true);

    await persistent.setItem('pref_theme', 'dark');
    expect(mockBackend.setItem).toHaveBeenCalledWith('pref_theme', JSON.stringify('dark'));

    const val = await persistent.getItem<string>('pref_theme');
    expect(val).toBe('dark');

    const keys = await persistent.getAllKeys();
    expect(keys).toContain('pref_theme');

    await persistent.removeItem('pref_theme');
    expect(await persistent.getItem('pref_theme')).toBeNull();

    await persistent.flushPersistence();
  });

  it('AsyncStorageAdapter ensures read-your-writes ordering by awaiting pendingWrites in getItem', async () => {
    let internalStore = '';
    let writeStarted = false;
    let resolveWrite: (() => void) | null = null;

    const slowBackend: IStorageBackend = {
      getItem: jest.fn(async () => internalStore),
      setItem: jest.fn(async (_k: string, v: string) => {
        writeStarted = true;
        await new Promise<void>(res => {
          resolveWrite = res;
        });
        internalStore = v;
      }),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    const persistent = new AsyncStorageAdapter(slowBackend);

    // Trigger setItem without awaiting
    const setPromise = persistent.setItem('token', 'abc');

    // Wait until backend.setItem has been called
    while (!writeStarted) {
      await new Promise(r => setTimeout(r, 5));
    }

    // Immediately trigger getItem: it should await pendingWrites instead of reading empty internalStore
    const getPromise = persistent.getItem<string>('token');

    // Release the write
    resolveWrite!();
    await setPromise;

    const readVal = await getPromise;
    expect(readVal).toBe('abc');
  });

  it('createStorageService creates correct adapter based on options', () => {
    const memory = createStorageService();
    expect(memory.isPersistent).toBe(false);

    const mockBackend: IStorageBackend = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    const persistent = createStorageService({
      adapter: 'persistent',
      backend: mockBackend,
    });
    expect(persistent.isPersistent).toBe(true);
  });
});
