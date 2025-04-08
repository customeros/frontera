import { it, expect, describe } from 'vitest';
import { AggregatePolicy } from '@/lib/policy/aggregate-policy';

import { Store } from '../store/store';
import { applyPolicies } from './apply';
import { Aggregate } from './aggregate-policy';

interface FakeEntity {
  id: string;
  contactIds: string[];
  ownerId: string | null;
}

class FakeAggregate extends Aggregate<FakeEntity> {
  get contactCount() {
    return this.base.contactIds.length;
  }
}

describe('AggregatePolicy', () => {
  it('should create an aggregate with resolved fields', () => {
    // 1. Create a fake entity
    const fakeEntity: FakeEntity = {
      id: '1',
      contactIds: ['c1', 'c2'],
      ownerId: 'o1',
    };

    // 2. Create a fake store
    const fakeStore = new Store<FakeEntity>();

    fakeStore.set(fakeEntity.id, fakeEntity);

    // 3. Create the aggregation spec
    const aggregationSpec = {
      contactIds: (ids: string[]) => ids.map((id) => `Resolved-${id}`),
      ownerId: (id: string | null) => (id ? { id, name: `Owner ${id}` } : null),
    };

    // 4. Create AggregatePolicy
    const aggregatePolicy = new AggregatePolicy<
      FakeEntity,
      typeof aggregationSpec,
      FakeAggregate
    >(FakeAggregate, aggregationSpec);

    // 5. Apply policies
    const store = applyPolicies(fakeStore, [aggregatePolicy]);

    // 6. Get the aggregate
    const aggregate = store.getAggregate('1');

    // 7. Assert fields
    expect(aggregate).toBeDefined();
    expect(aggregate?.base.id).toBe('1');
    expect(aggregate?.contactIds).toEqual(['Resolved-c1', 'Resolved-c2']);
    expect(aggregate?.ownerId).toEqual({ id: 'o1', name: 'Owner o1' });
    expect(aggregate?.contactCount).toEqual(2);
  });
});
