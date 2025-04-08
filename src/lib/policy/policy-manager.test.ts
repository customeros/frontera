/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect, describe } from 'vitest';

import { Policy } from './policy';
import { Store } from '../store/store';
import { PolicyManager } from './policy-manager';

class TestPolicy extends Policy<any> {
  attached = false;
  detached = false;
  changes: any[] = [];

  onAttach(_store: Store<any>) {
    this.attached = true;
  }

  onDetach() {
    this.detached = true;
  }

  onChange(key: string | number, value: any | undefined) {
    this.changes.push({ key, value });
  }
}

describe('PolicyManager', () => {
  it('registers policies and calls onAttach', () => {
    const store = new Store();
    const manager = new PolicyManager(store);

    const policy = new TestPolicy();

    manager.register(policy);

    expect(policy.attached).toBe(true);
  });

  it('calls onChange on policies', () => {
    const store = new Store();
    const manager = new PolicyManager(store);

    const policy = new TestPolicy();

    manager.register(policy);

    manager.onChange('key', 'value');

    expect(policy.changes).toEqual([{ key: 'key', value: 'value' }]);
  });

  it('calls onDetach on all policies when detachAll is called', () => {
    const store = new Store();
    const manager = new PolicyManager(store);

    const policy1 = new TestPolicy();
    const policy2 = new TestPolicy();

    manager.register(policy1);
    manager.register(policy2);

    manager.detachAll();

    expect(policy1.detached).toBe(true);
    expect(policy2.detached).toBe(true);
  });
});
