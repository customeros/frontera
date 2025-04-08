/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from '../store/store';
import { Policy, FetchContext } from './policy';

interface BackgroundRefreshOptions {
  intervalMs: number; // how often to refresh
  keys?: (string | number)[]; // optional: which keys to refresh; if not set, refresh everything in store
}

export class BackgroundRefreshPolicy<T> extends Policy<T> {
  private store!: Store<T>;
  private intervalId: any;
  private options: BackgroundRefreshOptions;

  constructor(options: BackgroundRefreshOptions) {
    super();
    this.options = options;
  }

  onAttach(store: Store<T>): void {
    this.store = store;
    this.startBackgroundRefresh();
  }

  onDetach(): void {
    this.stopBackgroundRefresh();
  }

  private startBackgroundRefresh() {
    this.intervalId = setInterval(() => {
      this.refreshKeys();
    }, this.options.intervalMs);
  }

  private stopBackgroundRefresh() {
    clearInterval(this.intervalId);
  }

  private async refreshKeys() {
    const keys = this.options.keys ?? Array.from(this.store.cache.keys());

    for (const key of keys) {
      const ctx = { key, store: this.store };

      // We simulate revalidation here; if there’s a fetch, we refetch it
      if (
        (this.shouldRevalidate && this.shouldRevalidate(ctx)) ||
        !this.shouldRevalidate
      ) {
        if (this.fetch) {
          const data = await this.fetch(ctx);

          this.store.set(key, data);
        }
      }
    }
  }

  // The default shouldRevalidate is always true unless overridden
  shouldRevalidate(_ctx: FetchContext): boolean {
    return true;
  }
}
