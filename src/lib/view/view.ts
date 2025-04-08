import hashit from 'hash-it';

import { ViewStore } from './view-store';

export class View<T extends object, V> {
  public readonly hash: number;
  public readonly compute: () => V;
  private readonly store: ViewStore;

  constructor(index: T, compute: () => V, store: ViewStore) {
    this.hash = hashit(index);
    this.compute = compute;
    this.store = store;

    this.store.set(this.hash, this.compute());
  }

  value() {
    return this.store.get(this.hash);
  }

  invalidate() {
    this.store.set(this.hash, this.compute());
  }

  dispose() {
    this.store.delete(this.hash);
  }
}
