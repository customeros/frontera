import { it, expect, describe } from 'vitest';

import { Store } from '../store/store';
import { FetchPolicy } from './fetch-policy';

describe('FetchPolicy', () => {
  it('fetches data when missing', async () => {
    const store = new Store<{ id: number }>({});

    const fetchPolicy = new FetchPolicy(async ({ key }) => ({
      id: Number(key),
    }));

    const shouldFetch = fetchPolicy.shouldFetch({ key: 1, store });

    expect(shouldFetch).toBe(true);

    const fetched = await fetchPolicy.fetch({ key: 1, store });

    expect(fetched).toEqual({ id: 1 });
  });

  it('does not fetch if value already exists', () => {
    const store = new Store<{ id: number }>();

    store.set(1, { id: 1 });

    const fetchPolicy = new FetchPolicy(async ({ key }) => ({
      id: Number(key),
    }));

    const shouldFetch = fetchPolicy.shouldFetch({ key: 1, store });

    expect(shouldFetch).toBe(false);
  });
});
