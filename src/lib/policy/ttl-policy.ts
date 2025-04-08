import { Store } from '../store/store';
import { Policy, FetchContext } from './policy';

interface TTLOptions {
  ttlMs: number; // Time to live in milliseconds
  prefix?: string; // Storage key prefix
  storage?: Storage; // Which storage to use (default localStorage)
  autoDelete?: boolean; // Should we delete expired keys automatically?
  persistTimestamps?: boolean; // Persist timestamps in storage
}

export class TTLPolicy<T> extends Policy<T> {
  private timestamps = new Map<string | number, number>();
  private ttlMs: number;
  private autoDelete: boolean;
  private persistTimestamps: boolean;
  private storage: Storage;
  private prefix: string;

  constructor(options: TTLOptions) {
    super();
    this.ttlMs = options.ttlMs;
    this.autoDelete = options.autoDelete ?? false;
    this.persistTimestamps = options.persistTimestamps ?? false;
    this.storage = options.storage || window.localStorage;
    this.prefix = options.prefix || 'ttl';
  }

  private storageKey(key: string | number) {
    return `${this.prefix}:${key}`;
  }

  private loadPersistedTimestamp(key: string | number) {
    const raw = this.storage.getItem(this.storageKey(key));

    if (raw) {
      const parsed = parseInt(raw, 10);

      if (!isNaN(parsed)) {
        this.timestamps.set(key, parsed);
      }
    }
  }

  private savePersistedTimestamp(key: string | number, timestamp: number) {
    this.storage.setItem(this.storageKey(key), timestamp.toString());
  }

  private removePersistedTimestamp(key: string | number) {
    this.storage.removeItem(this.storageKey(key));
  }

  onAttach(_store: Store<T>) {
    // If persistence is enabled, load all timestamps
    if (this.persistTimestamps) {
      for (let i = 0; i < this.storage.length; i++) {
        const storageKey = this.storage.key(i);

        if (storageKey && storageKey.startsWith(this.prefix + ':')) {
          const raw = this.storage.getItem(storageKey);

          if (raw) {
            const keyPart = storageKey.slice(this.prefix.length + 1);
            const key = isNaN(Number(keyPart)) ? keyPart : Number(keyPart);
            const parsed = parseInt(raw, 10);

            if (!isNaN(parsed)) {
              this.timestamps.set(key, parsed);
            }
          }
        }
      }
    }
  }

  onChange(key: string | number, value: T | undefined) {
    if (value !== undefined) {
      const now = Date.now();

      this.timestamps.set(key, now);

      if (this.persistTimestamps) {
        this.savePersistedTimestamp(key, now);
      }
    } else {
      this.timestamps.delete(key);

      if (this.persistTimestamps) {
        this.removePersistedTimestamp(key);
      }
    }
  }

  shouldFetch(ctx: FetchContext): boolean {
    const { key, store } = ctx;
    const value = store.get(key);

    if (value === undefined) return true;

    const timestamp = this.timestamps.get(key);

    if (!timestamp) return true;

    const now = Date.now();
    const expired = now - timestamp > this.ttlMs;

    if (expired && this.autoDelete) {
      store.delete(key);
      this.timestamps.delete(key);

      if (this.persistTimestamps) {
        this.removePersistedTimestamp(key);
      }

      return true;
    }

    return expired;
  }

  shouldRevalidate(ctx: FetchContext): boolean {
    return this.shouldFetch(ctx);
  }
}
