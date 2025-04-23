/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from '../store/store';
import { Policy, FetchContext } from './policy';

export class PolicyManager<T> {
  private policies: Policy<T>[] = [];
  private pending: Promise<any>[] = [];

  constructor(private store: Store<T>) {}

  async register(policy: Policy<T>) {
    this.policies.push(policy);

    const result = policy.onAttach(this.store);

    if (result instanceof Promise) {
      this.pending.push(result);
      await result;
    }
  }

  async ready(): Promise<void> {
    await Promise.all(this.pending);
  }

  maybeFetch(key: string | number) {
    const ctx: FetchContext = { key, store: this.store };

    const needsFetch = this.policies.some((p) => p.shouldFetch?.(ctx));

    if (needsFetch) {
      for (const policy of this.policies) {
        if (policy.fetch) {
          policy
            .fetch(ctx)
            .then((data) => {
              this.store.set(key, data);
            })
            .catch((err) => {
              console.error('[PolicyManager] background fetch failed.', err);
            });

          break; // only trigger fetch once
        }
      }
    }

    return this.store.get(key);
  }

  async revalidate(key: string | number) {
    const ctx: FetchContext = { key, store: this.store };

    for (const policy of this.policies) {
      if (policy.shouldRevalidate?.(ctx) && policy.fetch) {
        const data = await policy.fetch(ctx);

        this.store.set(key, data);
      }
    }
  }

  onChange(key: string | number, value: T | undefined) {
    for (const policy of this.policies) {
      policy.onChange?.(key, value);
    }
  }

  detachAll() {
    for (const policy of this.policies) {
      if (typeof (policy as any).onDetach === 'function') {
        (policy as any).onDetach();
      }
    }
  }

  suspendSync(fn: () => void) {
    for (const policy of this.policies) {
      if (typeof (policy as any).suspendSync === 'function') {
        (policy as any).suspendSync(fn);
      }
    }
  }
}
