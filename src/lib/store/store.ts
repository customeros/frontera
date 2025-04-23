import { CacheOption, normalizeCacheFactory } from '../util';

interface StoreOptions<T> {
  indexBy?: keyof T;
  cache?: CacheOption<T>;
  mutator?: (fn: () => void) => unknown;
}

export class Store<T> {
  public indexBy?: keyof T;
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
    this.indexBy = options?.indexBy;
  }

  private mutate(fn: () => unknown): unknown {
    if (this.mutator) {
      return this.mutator(fn);
    } else {
      return fn();
    }
  }

  get size() {
    return this.cache.size;
  }

  set(key: string | number, value: T) {
    this.mutate(() => {
      this.cache.set(key, value);
    });

    return this.cache;
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

  has(key: string | number) {
    return this.cache.has(key);
  }

  clear() {
    let res;

    this.mutate(() => {
      res = this.cache.clear();
    });

    return res;
  }

  toArray() {
    return Array.from(this.cache.values());
  }

  sync(entity: T) {
    if (!this.indexBy) {
      return;
    }

    this.set(entity[this.indexBy!] as string | number, entity);
  }
}
