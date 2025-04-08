/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { autorun } from 'mobx';
import { Channel } from 'phoenix';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { View } from './view';
import { ViewStore } from './view-store';
import { PhoenixMap, PhoenixStoreEvent } from '../map/phoenix-map';

describe('View + ViewStore + PhoenixMap real-time sync and MobX reactivity', () => {
  let eventBus: ((topic: string, payload: PhoenixStoreEvent) => void)[] = [];

  const createChannel = (
    onMessage: (topic: string, payload: PhoenixStoreEvent) => void,
  ) => {
    const handlers: Record<string, Function> = {};

    const channel = {
      push: (topic: string, payload: PhoenixStoreEvent) => {
        for (const fn of eventBus) {
          if (fn !== onMessage) {
            fn(topic, payload);
          }
        }
      },
      on: vi.fn((event, callback) => {
        handlers[event] = callback;

        return Math.floor(Math.random() * 100);
      }),
      off: vi.fn(),
      topic: 'test',
      state: 'joined',
      join: vi.fn(),
      leave: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
      onMessage: vi.fn(),
    } as unknown as Channel;

    return { channel, handlers };
  };

  let storeA: ViewStore;
  let storeB: ViewStore;
  let chanA: ReturnType<typeof createChannel>;
  let chanB: ReturnType<typeof createChannel>;

  beforeEach(() => {
    eventBus = [];

    chanA = createChannel(() => {});
    storeA = new ViewStore({
      cache: () => new PhoenixMap(chanA.channel),
    });

    chanB = createChannel(() => {});
    storeB = new ViewStore({
      cache: () => new PhoenixMap(chanB.channel),
    });

    eventBus[0] = (topic, payload) => {
      chanB.handlers[topic]?.(payload);
    };

    eventBus[1] = (topic, payload) => {
      chanA.handlers[topic]?.(payload);
    };
  });

  describe('Basic real-time sync with MobX reactivity', () => {
    it('should sync data between clients and trigger autorun', () => {
      const src = { shared: true };
      let value = ['start'];
      const run = vi.fn(() => value);

      const viewA = new View(src, run, storeA);
      const hash = viewA.hash;

      let observed: unknown;
      const dispose = autorun(() => {
        observed = storeB.get(hash);
      });

      expect(observed).toEqual(['start']);

      value = ['updated'];
      viewA.invalidate();

      expect(observed).toEqual(['updated']);

      dispose();
    });
  });

  describe('Deletion sync', () => {
    it('should delete entries across clients and update autorun observer', () => {
      const src = { toDelete: true };
      const run = vi.fn(() => 'delete-me');

      const viewA = new View(src, run, storeA);
      const hash = viewA.hash;

      let exists = false;
      const dispose = autorun(() => {
        exists = storeB.has(hash);
      });

      expect(exists).toBe(true);

      viewA.dispose(); // Deletes from storeA and syncs

      expect(exists).toBe(false);

      dispose();
    });
  });

  describe('Clear all entries sync', () => {
    it('should clear all entries across clients and update autorun observers', () => {
      const _view1 = new View({ clear: 1 }, () => 'one', storeA);
      const _view2 = new View({ clear: 2 }, () => 'two', storeA);

      let count = 0;
      const dispose = autorun(() => {
        count = (storeB as any).cache.size;
      });

      expect(count).toBe(2);

      (storeA as any).cache.clear(); // Direct clear call on PhoenixMap

      expect(count).toBe(0);

      dispose();
    });
  });

  describe('Invalidate sync and fetchOnInvalidate logic', () => {
    it('should handle invalidate and refetch remotely', async () => {
      const refetchedValue = 'refetched!';
      const src = { refresh: true };
      const run = vi.fn(() => 'initial');

      const fetchOnInvalidate = vi.fn(async (_key) => refetchedValue);

      const mapA = new PhoenixMap(chanA.channel, { fetchOnInvalidate });
      const mapB = new PhoenixMap(chanB.channel, { fetchOnInvalidate });

      storeA = new ViewStore({ cache: () => mapA });
      storeB = new ViewStore({ cache: () => mapB });

      eventBus[0] = (topic, payload) => {
        chanB.handlers[topic]?.(payload);
      };

      eventBus[1] = (topic, payload) => {
        chanA.handlers[topic]?.(payload);
      };

      const viewA = new View(src, run, storeA);
      const hash = viewA.hash;

      let fetchedValue: unknown;
      const dispose = autorun(() => {
        fetchedValue = storeB.get(hash);
      });

      // Trigger invalidate event
      eventBus[0]('store:invalidate', {
        type: 'store:invalidate',
        key: hash,
        source: 'external',
      });

      await new Promise((resolve) => setTimeout(resolve, 20)); // wait for async fetch

      expect(fetchedValue).toBe(refetchedValue);

      dispose();
    });
  });

  describe('Conflict resolution using versionBy', () => {
    it('should reject older versions and accept newer ones', () => {
      const mapA = new PhoenixMap(chanA.channel, { versionBy: 'updatedAt' });
      const mapB = new PhoenixMap(chanB.channel, { versionBy: 'updatedAt' });

      storeA = new ViewStore({ cache: () => mapA });
      storeB = new ViewStore({ cache: () => mapB });

      eventBus[0] = (topic, payload) => {
        chanB.handlers[topic]?.(payload);
      };

      eventBus[1] = (topic, payload) => {
        chanA.handlers[topic]?.(payload);
      };

      const src = { conflict: true };
      const now = Date.now();
      const run = vi.fn(() => ({ data: 'v1', updatedAt: now }));

      const viewA = new View(src, run, storeA);
      const hash = viewA.hash;

      expect(storeB.get(hash)).toMatchObject({ data: 'v1' });

      // Send an older version
      eventBus[0]('store:set', {
        type: 'store:set',
        key: hash,
        value: { data: 'old', updatedAt: now - 1000 },
        source: 'external',
      });

      expect(storeB.get(hash)).toMatchObject({ data: 'v1' }); // unchanged

      // Send a newer version
      eventBus[0]('store:set', {
        type: 'store:set',
        key: hash,
        value: { data: 'v2', updatedAt: now + 1000 },
        source: 'external',
      });

      expect(storeB.get(hash)).toMatchObject({ data: 'v2' });
    });
  });
});
