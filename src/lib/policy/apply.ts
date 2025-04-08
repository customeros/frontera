/* eslint-disable @typescript-eslint/no-explicit-any */
import { Policy } from './policy';
import { Store } from '../store/store';
import { PolicyManager } from './policy-manager';

type ExtractAggregateType<Policies extends Policy<any>[]> =
  Policies[number] extends { _aggregateType: infer A } ? A : never;

export function applyPolicies<
  Key extends string | number = string | number,
  Value = unknown,
  Policies extends Policy<Value>[] = Policy<Value>[],
>(
  store: Store<Value>,
  policies: Policies,
): Store<Value> & {
  destroy(): void;
  revalidate(key: Key): Promise<void>;
  getOrFetch(key: Key): Promise<Value | undefined>;
  getAggregate(key: Key): ExtractAggregateType<Policies> | undefined;
  policyManager: PolicyManager<Value, ExtractAggregateType<Policies>>;
} {
  const manager = new PolicyManager<Value, ExtractAggregateType<Policies>>(
    store,
  );

  policies.forEach((policy) => {
    manager.register(policy);
  });

  const originalSet = store.set.bind(store);
  const originalDelete = store.delete.bind(store);

  store.set = (key, value) => {
    const result = originalSet(key, value);

    manager.onChange(key, value);

    return result;
  };

  store.delete = (key) => {
    const result = originalDelete(key);

    manager.onChange(key, undefined);

    return result;
  };

  return Object.assign(store, {
    policyManager: manager,
    getOrFetch(key: Key) {
      return manager.maybeFetch(key);
    },
    revalidate(key: Key) {
      return manager.revalidate(key);
    },
    destroy() {
      manager.detachAll();
    },
    getAggregate(key: Key) {
      return manager.getAggregate(key) as
        | ExtractAggregateType<Policies>
        | undefined;
    },
  });
}
