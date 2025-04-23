import hashit from 'hash-it';

import { ViewStore } from './view-store';

export class View<Config extends object, Values> {
  public readonly hash: number;
  public readonly compute: () => Values;
  private readonly store: ViewStore<Values>;

  constructor(config: Config, compute: () => Values, store: ViewStore<Values>) {
    this.hash = hashit(config);
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
