/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from '../store/store';
import { Policy, FetchContext } from './policy';
import { AggregatePolicy } from './aggregate-policy';

export class PolicyManager<T, TAggregate = unknown> {
  private policies: Policy<T>[] = [];
  private pending: Promise<any>[] = [];
  private aggregatePolicy?: AggregatePolicy<T, any, any>;

  constructor(private store: Store<T>) {}

  async register(policy: Policy<T>) {
    this.policies.push(policy);

    const result = policy.onAttach(this.store);

    if (policy instanceof AggregatePolicy) {
      this.aggregatePolicy = policy;
    }

    if (result instanceof Promise) {
      this.pending.push(result);
      await result;
    }
  }

  async ready(): Promise<void> {
    await Promise.all(this.pending);
  }

  async maybeFetch(key: string | number) {
    const ctx: FetchContext = { key, store: this.store };

    const needsFetch = this.policies.some((p) => p.shouldFetch?.(ctx));

    if (needsFetch) {
      for (const policy of this.policies) {
        if (policy.fetch) {
          try {
            const data = await policy.fetch(ctx);

            this.store.set(key, data);

            return data;
          } catch (err) {
            console.error('[PolicyManager] background fetch failed.');
          }
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

  getAggregate(key: string | number): TAggregate | undefined {
    if (this.aggregatePolicy) {
      const ctx: FetchContext = { key, store: this.store };

      return this.aggregatePolicy.getAggregate(ctx) as TAggregate;
    }

    return undefined;
  }
}
