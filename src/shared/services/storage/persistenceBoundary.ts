import { IStorageService } from './storageService';

export type PersistenceStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PersistenceBoundaryOptions<T> {
  storageKey: string;
  storageService: IStorageService;
  defaultData: T;
  validate?: (data: unknown) => data is T;
  onReadError?: (error: unknown) => void;
  onWriteError?: (error: unknown, attemptedData: T) => void;
}

/**
 * SafePersistenceStore:
 * Encapsulates the local data persistence lifecycle to prevent data loss.
 *
 * Core Guarantees:
 * 1. Read-before-interactive: Requires explicit initialize() before allowing business writes.
 * 2. Anti-clobber guard: If reading existing storage fails or corrupts, it does NOT automatically
 *    overwrite existing on-disk storage with empty default data.
 * 3. Candidate Staging: Multi-step modifications or backups are verified as candidate states first,
 *    written and flushed to disk, and ONLY THEN updated in active in-memory state.
 * 4. Write Failure Alert & Rollback: Notifies callers on write failure without corrupting state.
 */
export class SafePersistenceStore<T> {
  private status: PersistenceStatus = 'idle';
  private data: T;
  private defaultData: T;
  private storageKey: string;
  private storageService: IStorageService;
  private validate?: (data: unknown) => data is T;
  private onReadError?: (error: unknown) => void;
  private onWriteError?: (error: unknown, attemptedData: T) => void;
  private stagedCandidate: T | null = null;
  private readError: unknown | null = null;

  constructor(options: PersistenceBoundaryOptions<T>) {
    this.storageKey = options.storageKey;
    this.storageService = options.storageService;
    this.defaultData = options.defaultData;
    this.data = options.defaultData;
    this.validate = options.validate;
    this.onReadError = options.onReadError;
    this.onWriteError = options.onWriteError;
  }

  getStatus(): PersistenceStatus {
    return this.status;
  }

  getData(): T {
    return this.data;
  }

  getReadError(): unknown | null {
    return this.readError;
  }

  /**
   * Initializes store by loading existing data from storage.
   * If storage contains valid data, it is adopted.
   * If storage is empty, defaultData is retained as pristine state.
   * If storage read throws or validation fails, transitions to 'error' status
   * and preserves existing disk contents without overwriting with defaultData.
   */
  async initialize(): Promise<{ success: boolean; data: T }> {
    this.status = 'loading';
    this.readError = null;

    try {
      const stored = await this.storageService.getItem<unknown>(this.storageKey);

      if (stored === null || stored === undefined) {
        // Pristine first install
        this.data = this.defaultData;
        this.status = 'ready';
        return { success: true, data: this.data };
      }

      if (this.validate && !this.validate(stored)) {
        throw new Error(`Data stored under '${this.storageKey}' failed schema validation`);
      }

      this.data = stored as T;
      this.status = 'ready';
      return { success: true, data: this.data };
    } catch (err) {
      this.status = 'error';
      this.readError = err;
      if (this.onReadError) {
        this.onReadError(err);
      }
      return { success: false, data: this.data };
    }
  }

  /**
   * Updates state and persists to storage.
   * If writing fails, onWriteError is triggered and the previous state is preserved.
   */
  async setData(newData: T): Promise<boolean> {
    if (this.validate && !this.validate(newData)) {
      throw new Error('Attempted to persist invalid data failing validation');
    }

    const previousData = this.data;
    try {
      await this.storageService.setItem(this.storageKey, newData);
      if (this.storageService.flushPersistence) {
        await this.storageService.flushPersistence();
      }
      this.data = newData;
      return true;
    } catch (err) {
      this.data = previousData;
      if (this.onWriteError) {
        this.onWriteError(err, newData);
      }
      return false;
    }
  }

  /**
   * Prepares a candidate state for atomic staging (e.g., during backup restore).
   */
  stageCandidate(candidate: T): void {
    if (this.validate && !this.validate(candidate)) {
      throw new Error('Candidate failed validation before staging');
    }
    this.stagedCandidate = candidate;
  }

  /**
   * Commits the staged candidate state:
   * First commits to persistent storage. If write succeeds, updates active memory state.
   * If write fails, active memory remains untouched and returns false.
   */
  async commitCandidate(): Promise<boolean> {
    if (this.stagedCandidate === null) {
      throw new Error('No candidate staged for commit');
    }

    const candidate = this.stagedCandidate;
    const success = await this.setData(candidate);
    if (success) {
      this.stagedCandidate = null;
    }
    return success;
  }

  /**
   * Aborts and discards any staged candidate without touching current state.
   */
  rollbackCandidate(): void {
    this.stagedCandidate = null;
  }

  getStagedCandidate(): T | null {
    return this.stagedCandidate;
  }
}
