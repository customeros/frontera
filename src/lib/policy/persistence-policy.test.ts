/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect, describe, beforeEach } from 'vitest';

import { Store } from '../store/store';
import { MockStorage } from '../test-util/mock-storage';
import { PersistencePolicy } from './persistence-policy';

describe('PersistencePolicy with MockStorage', () => {
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
  });

  it('saves to storage on change', () => {
    const policy = new PersistencePolicy({ storage, prefix: 'test' });

    policy.onChange('1', { id: 1 });

    const stored = storage.getItem('test:1');

    expect(stored).toBe(JSON.stringify({ id: 1 }));
  });

  it('removes from storage on delete', () => {
    const policy = new PersistencePolicy({ storage, prefix: 'test' });

    storage.setItem('test:1', JSON.stringify({ id: 1 }));

    policy.onChange('1', undefined);

    const stored = storage.getItem('test:1');

    expect(stored).toBe(null);
  });

  it('loads persisted values on attach', () => {
    const store = new Store<any>();
    const policy = new PersistencePolicy({ storage, prefix: 'test' });

    storage.setItem('test:1', JSON.stringify({ id: 1 }));

    policy.onAttach(store);

    expect(store.get('1')).toEqual({ id: 1 });
  });
});
