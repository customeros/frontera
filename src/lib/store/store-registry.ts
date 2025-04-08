/* eslint-disable @typescript-eslint/no-explicit-any */
export class StoreRegistry<TStores extends Record<string, any>> {
  static #instance?: unknown;
  private stores = new Map<keyof TStores, unknown>();

  register<K extends keyof TStores>(key: K, store: TStores[K]) {
    if (this.stores.has(key)) {
      throw new Error(`Store already registered with key "${String(key)}"`);
    }
    this.stores.set(key, store);
  }

  get<K extends keyof TStores>(key: K): TStores[K] {
    const store = this.stores.get(key);

    if (!store) {
      throw new Error(`No store registered under key "${String(key)}"`);
    }

    return store as TStores[K];
  }

  has<K extends keyof TStores>(key: K): boolean {
    return this.stores.has(key);
  }

  static create<TStores extends Record<string, any>>() {
    if (!StoreRegistry.#instance) {
      StoreRegistry.#instance = new StoreRegistry<TStores>();
    }

    return StoreRegistry.#instance as StoreRegistry<TStores>;
  }

  static getInstance<TStores extends Record<string, any>>() {
    if (!StoreRegistry.#instance) {
      throw new Error(
        'StoreRegistry not initialized. Call StoreRegistry.create first',
      );
    }

    return StoreRegistry.#instance as StoreRegistry<TStores>;
  }
}
