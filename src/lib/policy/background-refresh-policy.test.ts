import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';

import { Store } from '../store/store';
import { BackgroundRefreshPolicy } from './background-refresh-policy.ts';

describe('BackgroundRefreshPolicy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('refreshes keys periodically', async () => {
    const store = new Store<{ id: number }>();

    store.set(1, { id: 1 });

    let fetchCalls = 0;

    const backgroundPolicy = new BackgroundRefreshPolicy<{ id: number }>({
      intervalMs: 1000,
    });

    backgroundPolicy.fetch = async ({ key }) => {
      fetchCalls++;

      return { id: Number(key) + 1 };
    };

    backgroundPolicy.onAttach(store);

    // advance fake timers
    vi.advanceTimersByTime(3000); // simulate 3 seconds

    expect(fetchCalls).toBeGreaterThanOrEqual(2);

    backgroundPolicy.onDetach();
  });
});
