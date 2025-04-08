import { Store } from '../store/store';
import { Policy, FetchContext } from './policy';

export class FetchPolicy<T> extends Policy<T> {
  constructor(private fetchFn: (ctx: FetchContext) => Promise<T>) {
    super();
  }

  onAttach(_store: Store<T>): void {
    // optional: could setup visibility listeners, etc.
  }

  shouldFetch(ctx: FetchContext): boolean {
    return ctx.store.get(ctx.key) === undefined;
  }

  async fetch(ctx: FetchContext): Promise<T> {
    return this.fetchFn(ctx);
  }
}
