import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { Store } from '../store/store';
import { TTLPolicy } from './ttl-policy';
import { MockStorage } from '../test-util/mock-storage';

describe('TTLPolicy', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = new MockStorage();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('considers data fresh before ttl expires', () => {
    const store = new Store<{ id: number }>();
    const policy = new TTLPolicy<{ id: number }>({ ttlMs: 1000 });

    store.set(1, { id: 1 });
    policy.onChange(1, { id: 1 });

    vi.advanceTimersByTime(500); // 0.5 seconds

    expect(policy.shouldFetch({ key: 1, store })).toBe(false);
  });

  it('considers data expired after ttl', () => {
    const store = new Store<{ id: number }>();
    const policy = new TTLPolicy<{ id: number }>({ ttlMs: 1000 });

    store.set(1, { id: 1 });
    policy.onChange(1, { id: 1 });

    vi.advanceTimersByTime(1500); // 1.5 seconds

    expect(policy.shouldFetch({ key: 1, store })).toBe(true);
  });

  it('auto-deletes expired data if configured', () => {
    const store = new Store<{ id: number }>();
    const policy = new TTLPolicy<{ id: number }>({
      ttlMs: 1000,
      autoDelete: true,
    });

    store.set(1, { id: 1 });
    policy.onChange(1, { id: 1 });

    vi.advanceTimersByTime(1500); // 1.5 seconds

    policy.shouldFetch({ key: 1, store });

    expect(store.get(1)).toBe(undefined); // Should be deleted
  });

  it('persists timestamps when persistTimestamps is true', () => {
    const store = new Store<{ id: number }>();
    const policy = new TTLPolicy<{ id: number }>({
      ttlMs: 1000,
      persistTimestamps: true,
      storage,
      prefix: 'test-ttl',
    });

    store.set(1, { id: 1 });
    policy.onChange(1, { id: 1 });

    const raw = storage.getItem('test-ttl:1');

    expect(raw).not.toBeNull();
  });

  it('loads persisted timestamps on attach', () => {
    const store = new Store<{ id: number }>();

    const now = Date.now();

    storage.setItem('test-ttl:1', now.toString());

    const policy = new TTLPolicy<{ id: number }>({
      ttlMs: 1000,
      persistTimestamps: true,
      storage,
      prefix: 'test-ttl',
    });

    policy.onAttach(store);

    vi.advanceTimersByTime(1500); // 1.5 seconds

    expect(policy.shouldFetch({ key: 1, store })).toBe(true); // expired
  });
});
