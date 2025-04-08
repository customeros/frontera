/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { Policy } from './policy';
import { Store } from '../store/store';
import { applyPolicies } from './apply';

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

  shouldFetch() {
    return true;
  }

  async fetch({ key }: { store: Store<any>; key: string | number }) {
    return { id: key };
  }
}

class AsyncTestPolicy extends Policy<any> {
  attached = false;

  async onAttach(_store: Store<any>): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate async work
    this.attached = true;
  }
}

describe('applyPolicies', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('enhances a store with policyManager, getOrFetch, revalidate, and destroy', () => {
    const store = new Store();
    const enhanced = applyPolicies(store, [new TestPolicy()]);

    expect(typeof enhanced.getOrFetch).toBe('function');
    expect(typeof enhanced.revalidate).toBe('function');
    expect(typeof enhanced.destroy).toBe('function');
    expect(enhanced.policyManager).toBeDefined();
  });

  it('fetches and sets data when calling getOrFetch', async () => {
    const store = new Store<any>();
    const enhanced = applyPolicies(store, [new TestPolicy()]);

    const result = await enhanced.getOrFetch(1);

    expect(result).toEqual({ id: 1 });
    expect(store.get(1)).toEqual({ id: 1 });
  });

  it('calls fetch again when revalidate is called', async () => {
    const store = new Store<any>();
    const enhanced = applyPolicies(store, [new TestPolicy()]);

    // First fetch
    await enhanced.getOrFetch(1);

    // Force revalidate
    await enhanced.revalidate(1);

    // After revalidate, value should be still correctly fetched
    expect(store.get(1)).toEqual({ id: 1 });
  });

  it("calls detachAll and policies' onDetach when destroy is called", () => {
    const store = new Store<any>();
    const policy = new TestPolicy();
    const enhanced = applyPolicies(store, [policy]);

    expect(policy.detached).toBe(false);

    enhanced.destroy();

    expect(policy.detached).toBe(true);
  });

  it('waits for async onAttach with policyManager.ready', async () => {
    const store = new Store();
    const asyncPolicy = new AsyncTestPolicy();
    const enhanced = applyPolicies(store, [asyncPolicy]);

    expect(asyncPolicy.attached).toBe(false);

    const readyPromise = enhanced.policyManager.ready();

    vi.advanceTimersByTime(1000);

    await readyPromise;

    expect(asyncPolicy.attached).toBe(true);
  });
});
