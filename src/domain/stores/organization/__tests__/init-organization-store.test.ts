/* eslint-disable @typescript-eslint/ban-types */
import { Channel } from 'phoenix';
import { Store } from '@/lib/store';
import { PhoenixMap } from '@/lib/map/phoenix-map';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';

import { Organization } from '../organization';

const handlers: Record<string, Function> = {};

const createChannelMock = (topic: string, _chanParams: object) => {
  return {
    push: vi.fn(),
    on: vi.fn((event, callback) => {
      handlers[event] = callback;

      return Math.floor(Math.random() * 100); // fake ref
    }),
    off: vi.fn(),
    topic: topic,
    state: 'joined',
    join: vi.fn(),
    leave: vi.fn(),
    onClose: vi.fn(),
    onError: vi.fn(),
    onMessage: vi.fn(),
  } as unknown as Channel;
};

vi.mock('@/infra/repositories/core/organization', () => {
  return {
    OrganizationRepository: vi.fn().mockImplementation(() => ({
      getOrganizationsByIds: vi.fn(async ({ ids }) => {
        if (ids[0].startsWith('fail')) {
          throw new Error('Fetch failed');
        }

        return {
          ui_organizations: [{ id: ids[0], name: 'Mock Organization' }],
        };
      }),
    })),
  };
});

vi.mock('@/infra/transport', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...(actual as typeof import('@/infra/transport')),
    Transport: {
      getInstance: vi.fn().mockImplementation(() => ({
        socket: {
          channel: createChannelMock,
        },
      })),
    },
  };
});

describe('OrganizationStore', () => {
  let OrganizationStore: typeof import('../organization.store').OrganizationStore;

  beforeEach(async () => {
    vi.useFakeTimers();

    const mod = await import('../organization.store');

    OrganizationStore = mod.OrganizationStore;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    OrganizationStore.clear();
  });

  it('should be an instance of Store', () => {
    expect(OrganizationStore).toBeInstanceOf(Store);
  });

  it('should have cache property as instance of PhoenixMap', () => {
    expect(OrganizationStore.cache).toBeInstanceOf(PhoenixMap);
  });

  it('should store and retrieve an organization manually', async () => {
    const org = new Organization({ id: '123', name: 'TestOrg' });

    OrganizationStore.set('123', org);

    expect(OrganizationStore.has('123')).toBe(true);
  });

  it('should fetch and organization if missing (getOrFetch)', async () => {
    const org = await OrganizationStore.getOrFetch('321');

    expect(org).toBeDefined();
    expect(org?.id).toBe('321');
    expect(org?.name).toBe('Mock Organization');

    expect(OrganizationStore.get('321')).toBe(org);
  });

  it('should delete an organization manually', async () => {
    const org = new Organization({ id: '456', name: 'ToDelete' });

    OrganizationStore.set('456', org);

    expect(OrganizationStore.has('456')).toBe(true);

    OrganizationStore.delete('456');

    expect(OrganizationStore.has('456')).toBe(false);
  });

  it('should not refetch if organization already exists', async () => {
    const org = new Organization({ id: '789', name: 'CachedOrg' });

    OrganizationStore.set('789', org);

    const fetched = await OrganizationStore.getOrFetch('789');

    expect(fetched).toBe(org);
  });

  it('should update store when receiving store:set event', () => {
    handlers['store:set']({
      type: 'store:set',
      key: 'abc',
      value: { id: 'abc', name: 'RemoteSyncedOrg' },
      source: crypto.randomUUID(),
    });

    expect(OrganizationStore.has('abc')).toBe(true);
  });

  it('should delete from store when receiving store:delete event', () => {
    const org = new Organization({ id: 'abc', name: 'ToBeDeletedOrg' });

    OrganizationStore.set(org.id, org);

    handlers['store:delete']({
      type: 'store:delete',
      key: 'abc',
      source: crypto.randomUUID(),
    });

    expect(OrganizationStore.has(org.id)).toBe(false);
  });

  it('should drop all entries from store when receiving store:clear event', () => {
    Array.from({ length: 10 })
      .map(
        (_v, i) =>
          new Organization({
            id: crypto.randomUUID(),
            name: `ToBeCleared-${i}`,
          }),
      )
      .forEach((org) => OrganizationStore.set(org.id, org));

    expect(OrganizationStore.size).toBe(10);

    handlers['store:clear']({
      type: 'store:clear',
      source: crypto.randomUUID(),
    });

    expect(OrganizationStore.size).toBe(0);
  });

  it('should refetch and update store when receiving store:invalidate event', async () => {
    handlers['store:invalidate']({
      type: 'store:invalidate',
      key: 'inv-123',
      source: crypto.randomUUID(),
    });

    // Simulate time for refetch to complete
    await vi.runAllTimersAsync();

    const refetchedOrg = OrganizationStore.get('inv-123');

    expect(refetchedOrg).toBeDefined();
    expect(refetchedOrg?.id).toBe('inv-123');
    expect(refetchedOrg?.name).toBe('Mock Organization');
  });

  it('should destroy the store and policies', () => {
    expect(() => {
      OrganizationStore.destroy();
    }).not.toThrow();
  });

  it('should handle fetch error gracefully', async () => {
    await expect(
      OrganizationStore.getOrFetch('fail-123'),
    ).resolves.toBeUndefined();
  });
});
