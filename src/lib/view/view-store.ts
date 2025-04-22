import hashit from 'hash-it';

import { CacheOption, normalizeCacheFactory } from '../util';

export interface ViewStoreOptions<Values> {
  cache?: CacheOption<Values>;
  mutator?: (fn: () => void) => unknown;
}

export class ViewStore<Values = unknown> {
  cache: Map<number | string, Values>;
  mutator?: (fn: () => void) => unknown;

  constructor(options?: ViewStoreOptions<Values>) {
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

  get(hashOrViewDef: number | object) {
    return this.cache.get(
      typeof hashOrViewDef === 'number' ? hashOrViewDef : hashit(hashOrViewDef),
    );
  }

  set(hash: number, value: Values) {
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
