export interface IStorageBackend {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys?(): Promise<readonly string[] | string[]>;
}

export interface IStorageService {
  /** Indicates whether data survives process restart or is purely in-memory. */
  readonly isPersistent: boolean;
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys?(): Promise<string[]>;
  flushPersistence?(): Promise<void>;
}

/**
 * In-Memory Storage Adapter.
 * Serves as an isolated test double for unit tests, CI test runs,
 * or as a fallback when native persistent storage is unavailable.
 */
export class InMemoryStorageAdapter implements IStorageService {
  readonly isPersistent: boolean = false;
  private store: Map<string, string> = new Map();

  async getItem<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (item === undefined || item === null) {
      return null;
    }
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.store.set(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.store.keys());
  }

  async flushPersistence(): Promise<void> {
    // No-op for in-memory store
  }
}

/**
 * Key-Value Persistent Storage Adapter.
 * Compatible with @react-native-async-storage/async-storage or react-native-mmkv.
 * Wraps persistent storage calls with serialization, null checks, and error boundaries.
 */
export class AsyncStorageAdapter implements IStorageService {
  readonly isPersistent: boolean = true;
  private backend: IStorageBackend;
  private pendingWrites: Promise<void> = Promise.resolve();

  constructor(backend: IStorageBackend) {
    this.backend = backend;
  }

  async getItem<T>(key: string): Promise<T | null> {
    const raw = await this.backend.getItem(key);
    if (raw === null || raw === undefined) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    const operation = this.pendingWrites.then(async () => {
      await this.backend.setItem(key, serialized);
    });
    this.pendingWrites = operation.catch(() => {});
    return operation;
  }

  async removeItem(key: string): Promise<void> {
    const operation = this.pendingWrites.then(async () => {
      await this.backend.removeItem(key);
    });
    this.pendingWrites = operation.catch(() => {});
    return operation;
  }

  async clear(): Promise<void> {
    const operation = this.pendingWrites.then(async () => {
      await this.backend.clear();
    });
    this.pendingWrites = operation.catch(() => {});
    return operation;
  }

  async getAllKeys(): Promise<string[]> {
    if (this.backend.getAllKeys) {
      const keys = await this.backend.getAllKeys();
      return Array.from(keys);
    }
    return [];
  }

  async flushPersistence(): Promise<void> {
    await this.pendingWrites;
  }
}

/**
 * Factory for creating configured storage services.
 * In production projects requiring on-device persistence:
 * ```ts
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * export const storageService = createStorageService({
 *   adapter: 'persistent',
 *   backend: AsyncStorage,
 * });
 * ```
 */
export function createStorageService(options?: {
  adapter?: 'memory' | 'persistent';
  backend?: IStorageBackend;
}): IStorageService {
  if (options?.adapter === 'persistent' && options.backend) {
    return new AsyncStorageAdapter(options.backend);
  }
  return new InMemoryStorageAdapter();
}

/**
 * Default template storage instance.
 * By default initialized with InMemoryStorageAdapter for zero-friction testing.
 * When integrating persistent settings, inject AsyncStorage via createStorageService.
 */
export const storageService: IStorageService = new InMemoryStorageAdapter();
