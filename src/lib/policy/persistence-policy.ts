import { Policy } from './policy';
import { Store } from '../store/store';

interface PersistenceOptions {
  prefix?: string; // optional key prefix for namespace separation
  storage?: Storage; // localStorage or sessionStorage by default
}

/**
 * Persists store data into localStorage (or another storage).
 */
export class PersistencePolicy<T> extends Policy<T> {
  private storage: Storage;
  private prefix: string;

  constructor(options?: PersistenceOptions) {
    super();
    this.storage = options?.storage || window.localStorage;
    this.prefix = options?.prefix || 'store';
  }

  private encodeKey(key: string | number): string {
    return `${this.prefix}:${key}`;
  }

  private decodeKey(encoded: string): string | number {
    return encoded.slice(this.prefix.length + 1);
  }

  onAttach(store: Store<T>) {
    // Load all previously saved entries
    for (let i = 0; i < this.storage.length; i++) {
      const storageKey = this.storage.key(i);

      if (storageKey && storageKey.startsWith(this.prefix + ':')) {
        const raw = this.storage.getItem(storageKey);

        if (raw !== null) {
          try {
            const value: T = JSON.parse(raw);
            const originalKey = this.decodeKey(storageKey);

            store.set(originalKey, value);
          } catch (e) {
            console.error(
              `PersistencePolicy: Failed to parse value for key ${storageKey}`,
              e,
            );
          }
        }
      }
    }
  }

  onChange(key: string | number, value: T | undefined): void {
    const storageKey = this.encodeKey(key);

    if (value !== undefined) {
      const serialized = JSON.stringify(value);

      this.storage.setItem(storageKey, serialized);
    } else {
      this.storage.removeItem(storageKey);
    }
  }
}
