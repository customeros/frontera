import { CacheOption, normalizeCacheFactory } from '../util';

export interface ViewStoreOptions {
  cache?: CacheOption<unknown>;
  mutator?: (fn: () => void) => unknown;
}

export class ViewStore {
  private cache: Map<number | string, unknown>;
  private mutator?: (fn: () => void) => unknown;

  constructor(options?: ViewStoreOptions) {
    if (options?.cache) {
      const factory = normalizeCacheFactory(options.cache);

      this.cache = factory();
    } else {
      this.cache = new Map();
    }

    this.mutator = options?.mutator;
  }

  private mutate(fn: () => void) {
    if (this.mutator) return this.mutator(fn);

    return fn();
  }

  get(hash: number) {
    return this.cache.get(hash);
  }

  set(hash: number, value: unknown) {
    this.mutate(() => {
      this.cache.set(hash, value);
    });
  }

  has(hash: number) {
    return this.cache.has(hash);
  }

  delete(hash: number) {
    this.mutate(() => {
      this.cache.delete(hash);
    });
  }

  clear() {
    this.mutate(() => {
      this.cache.clear();
    });
  }
}
