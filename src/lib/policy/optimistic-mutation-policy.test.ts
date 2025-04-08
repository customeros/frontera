/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { Store } from '../store/store';
import { OptimisticMutationPolicy } from './optimistic-mutation-policy';

describe('OptimisticMutationPolicy', () => {
  let store: Store<any>;

  beforeEach(() => {
    store = new Store();
  });

  it('optimistically updates the store and clears snapshot on success', async () => {
    const mutationFn = vi.fn(() => Promise.resolve());

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
    });

    policy.onAttach(store);

    await policy.onChange(1, { id: 1, name: 'Alice' });

    expect(store.get(1)).toEqual({ id: 1, name: 'Alice' });

    // mutationFn should have been called
    expect(mutationFn).toHaveBeenCalledWith(1, { id: 1, name: 'Alice' });

    // Snapshot should be cleared
    expect((policy as any).snapshots.size).toBe(0);
  });

  it('rolls back the store on mutation failure', async () => {
    const mutationFn = vi.fn(() =>
      Promise.reject(new Error('Mutation failed')),
    );

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
    });

    policy.onAttach(store);

    // Set initial value
    store.set(1, { id: 1, name: 'Original' });

    await policy.onChange(1, { id: 1, name: 'Optimistic' });

    // After optimistic update
    expect(store.get(1)).toEqual({ id: 1, name: 'Original' });

    // mutationFn should have been called
    expect(mutationFn).toHaveBeenCalledWith(1, { id: 1, name: 'Optimistic' });
  });

  it('rolls back delete operations correctly', async () => {
    const mutationFn = vi.fn(() =>
      Promise.reject(new Error('Mutation failed')),
    );

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
    });

    policy.onAttach(store);

    // Set initial value
    store.set(1, { id: 1, name: 'To be deleted' });

    // Try to optimistically delete
    await policy.onChange(1, undefined);

    // Should rollback and restore the deleted value
    expect(store.get(1)).toEqual({ id: 1, name: 'To be deleted' });

    expect(mutationFn).toHaveBeenCalledWith(1, undefined);
  });

  it('does nothing if store is empty initially and delete is called', async () => {
    const mutationFn = vi.fn(() =>
      Promise.reject(new Error('Mutation failed')),
    );

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
    });

    policy.onAttach(store);

    // Try to optimistically delete non-existing key
    await policy.onChange(999, undefined);

    // Store should still not have the key
    expect(store.get(999)).toBeUndefined();

    expect(mutationFn).toHaveBeenCalledWith(999, undefined);
  });
});

describe('OptimisticMutationPolicy with retry logic', () => {
  let store: Store<any>;

  beforeEach(() => {
    store = new Store();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries mutation and succeeds without rollback', async () => {
    const mutationFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Temporary error')) // First attempt fails
      .mockResolvedValueOnce(undefined); // Second attempt succeeds

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
      maxRetries: 3,
      retryDelayMs: 1000,
    });

    policy.onAttach(store);

    const promise = policy.onChange(1, { id: 1, name: 'Alice' });

    // Fast forward time for retry delay
    vi.advanceTimersByTime(1000);

    // Flush all timers and microtasks
    await vi.runAllTimersAsync();

    await promise;

    // Mutation should have succeeded
    expect(store.get(1)).toEqual({ id: 1, name: 'Alice' });

    // mutationFn should have been called twice
    expect(mutationFn).toHaveBeenCalledTimes(2);

    // Snapshot should be cleared
    expect((policy as any).snapshots.size).toBe(0);
  });

  it('rolls back if all retries fail', async () => {
    const mutationFn = vi.fn(() =>
      Promise.reject(new Error('Persistent failure')),
    );

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
      maxRetries: 2, // Allow 2 retries
      retryDelayMs: 500,
    });

    policy.onAttach(store);

    store.set(1, { id: 1, name: 'Original' });

    const promise = policy.onChange(1, { id: 1, name: 'Optimistic' });

    // Fast-forward enough time for retries
    vi.advanceTimersByTime(500); // after first failure
    vi.advanceTimersByTime(500); // after second failure
    vi.advanceTimersByTime(500); // after third (final failure)

    // Flush all timers and microtasks
    await vi.runAllTimersAsync();

    await promise;

    // It should rollback
    expect(store.get(1)).toEqual({ id: 1, name: 'Original' });

    // mutationFn should have been called 3 times: initial + 2 retries
    expect(mutationFn).toHaveBeenCalledTimes(3);
  });

  it('respects retry delay between attempts', async () => {
    const mutationFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce(undefined);

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
      maxRetries: 1,
      retryDelayMs: 2000,
    });

    policy.onAttach(store);

    const promise = policy.onChange(1, { id: 1, name: 'Delayed' });

    // Not enough time passed yet
    vi.advanceTimersByTime(1000);

    expect(mutationFn).toHaveBeenCalledTimes(1); // first call done, waiting retry

    // Advance full retry delay
    vi.advanceTimersByTime(1000);

    // Flush all timers and microtasks
    await vi.runAllTimersAsync();

    await promise;

    // Should succeed after retry
    expect(mutationFn).toHaveBeenCalledTimes(2);
    expect(store.get(1)).toEqual({ id: 1, name: 'Delayed' });
  });

  it('calls onRetry callback during retries', async () => {
    const mutationFn = vi
      .fn()
      .mockRejectedValue(new Error('Temporary failure'));

    const onRetry = vi.fn();

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
      maxRetries: 2,
      retryDelayMs: 1000,
      onRetry,
    });

    policy.onAttach(store);

    const promise = policy.onChange(1, { id: 1, name: 'Retrying' });

    vi.advanceTimersByTime(1000);
    await vi.runAllTimersAsync();

    vi.advanceTimersByTime(2000);
    await vi.runAllTimersAsync();

    vi.advanceTimersByTime(4000);
    await vi.runAllTimersAsync();

    await promise;

    expect(onRetry).toHaveBeenCalledTimes(2); // 2 retries (not counting initial attempt)
    expect(onRetry).toHaveBeenCalledWith({ key: 1, attempt: 1, delayMs: 1000 });
    expect(onRetry).toHaveBeenCalledWith({ key: 1, attempt: 2, delayMs: 2000 });
  });
});

describe('OptimisticMutationPolicy with exponential backoff and smart errors', () => {
  let store: Store<any>;

  beforeEach(() => {
    store = new Store();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('increases retry delay exponentially', async () => {
    const mutationFn = vi
      .fn()
      .mockRejectedValue(new Error('Temporary failure'));

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
      maxRetries: 3,
      retryDelayMs: 1000, // base delay
    });

    policy.onAttach(store);

    const promise = policy.onChange(1, { id: 1, name: 'Exponential' });

    // 1st attempt failed, wait 1s
    vi.advanceTimersByTime(1000);
    await vi.runAllTimersAsync();

    // 2nd attempt failed, wait 2s
    vi.advanceTimersByTime(2000);
    await vi.runAllTimersAsync();

    // 3rd attempt failed, wait 4s
    vi.advanceTimersByTime(4000);
    await vi.runAllTimersAsync();

    await promise;

    expect(mutationFn).toHaveBeenCalledTimes(4); // initial + 3 retries
  });

  it('rolls back immediately on non-retryable error', async () => {
    const mutationFn = vi.fn(() => Promise.reject(new Error('Fatal error')));

    const policy = new OptimisticMutationPolicy<any>({
      mutationFn,
      maxRetries: 3,
      retryDelayMs: 1000,
      isRetryableError: (_error) => {
        // Mark this error as non-retryable
        return false;
      },
    });

    policy.onAttach(store);

    store.set(1, { id: 1, name: 'Original' });

    const promise = policy.onChange(1, { id: 1, name: 'ShouldRollback' });

    // No retry delay needed
    await promise;

    // Immediate rollback
    expect(store.get(1)).toEqual({ id: 1, name: 'Original' });

    expect(mutationFn).toHaveBeenCalledTimes(1); // Only one call
  });
});
