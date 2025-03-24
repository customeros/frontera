import { CacheOption, normalizeCacheFactory } from './util';

interface StoreOptions<T> {
  cache?: CacheOption<T>;
  mutator?: (fn: () => void) => unknown;
}

export class Store<T> {
  public mutator?: (fn: () => void) => unknown;
  public cache: Map<string | number, T> = new Map();

  constructor(options?: StoreOptions<T>) {
    if (options?.cache) {
      const factory = normalizeCacheFactory(options.cache);

      this.cache = factory();
    } else {
      this.cache = new Map();
    }

    this.mutator = options?.mutator;
  }

  private mutate(fn: () => unknown): unknown {
    if (this.mutator) {
      return this.mutator(fn);
    } else {
      return fn();
    }
  }

  set(key: string | number, value: T) {
    let res;

    this.mutate(() => {
      res = this.cache.set(key, value);
    });

    return res;
  }

  get(key: string | number) {
    return this.cache.get(key);
  }

  delete(key: string | number) {
    let res;

    this.mutate(() => {
      res = this.cache.delete(key);
    });

    return res;
  }
}
