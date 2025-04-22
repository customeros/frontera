/* eslint-disable @typescript-eslint/no-explicit-any */
import { Policy } from './policy';
import { Store } from '../store/store';
import { PolicyManager } from './policy-manager';

export function applyPolicies<
  Key extends string | number = string | number,
  Value = unknown,
  Policies extends Policy<Value>[] = Policy<Value>[],
>(
  store: Store<Value>,
  policies: Policies,
): Store<Value> & {
  destroy(): void;
  suspendSync(fn: () => void): void;
  revalidate(key: Key): Promise<void>;
  policyManager: PolicyManager<Value>;
  getOrFetch(key: Key): Value | undefined;
} {
  const manager = new PolicyManager<Value>(store);

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
    suspendSync(fn: () => void) {
      return manager.suspendSync(fn);
    },
  });
}
