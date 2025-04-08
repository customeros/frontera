/* eslint-disable @typescript-eslint/ban-types */
import { Channel } from 'phoenix';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { View } from './view';
import { ViewStore } from './view-store';
import { PhoenixMap, PhoenixStoreEvent } from '../map/phoenix-map';

describe('ViewStore + PhoenixMap delayed delivery and conflict resolution', () => {
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
      cache: () =>
        new PhoenixMap<string, { updatedAt: string }>(chanA.channel, {
          versionBy: 'updatedAt',
        }),
    });

    chanB = createChannel(() => {});
    storeB = new ViewStore({
      cache: () =>
        new PhoenixMap<string, { updatedAt: string }>(chanB.channel, {
          versionBy: 'updatedAt',
        }),
    });

    eventBus[0] = (topic, payload) => {
      chanB.handlers[topic]?.(payload);
    };

    eventBus[1] = (topic, payload) => {
      chanA.handlers[topic]?.(payload);
    };
  });

  it('should reject delayed older updates and accept newer ones correctly', async () => {
    const src = { type: 'delayed-conflict' };
    const now = Date.now();
    const run = vi.fn(() => ({ data: 'initial', updatedAt: now }));

    const viewA = new View(src, run, storeA);
    const hash = viewA.hash;

    expect(storeB.get(hash)).toMatchObject({ data: 'initial' });

    // Simulate a new version that should arrive immediately
    const newVersion = { data: 'newer', updatedAt: now + 2000 };

    eventBus[0]('store:set', {
      type: 'store:set',
      key: hash,
      value: newVersion,
      source: 'external',
    });

    expect(storeB.get(hash)).toMatchObject({ data: 'newer' });

    // Now simulate a delayed old update that arrives late
    const delayedOldVersion = { data: 'very-old', updatedAt: now - 5000 };

    // Simulate delayed arrival (setTimeout)
    await new Promise((resolve) => setTimeout(resolve, 10)); // fake some delay

    eventBus[0]('store:set', {
      type: 'store:set',
      key: hash,
      value: delayedOldVersion,
      source: 'external',
    });

    // After delayed old update, the value should still be the latest one
    expect(storeB.get(hash)).toMatchObject({ data: 'newer' });
  });

  it('should accept delayed newer updates and override older values', async () => {
    const src = { type: 'delayed-future' };
    const now = Date.now();
    const run = vi.fn(() => ({ data: 'early', updatedAt: now }));

    const viewA = new View(src, run, storeA);
    const hash = viewA.hash;

    expect(storeB.get(hash)).toMatchObject({ data: 'early' });

    // Simulate a delayed *newer* version (future timestamp)
    const delayedNewerVersion = {
      data: 'delayed-newer',
      updatedAt: now + 3000,
    };

    await new Promise((resolve) => setTimeout(resolve, 10)); // simulate delivery lag

    eventBus[0]('store:set', {
      type: 'store:set',
      key: hash,
      value: delayedNewerVersion,
      source: 'external',
    });

    // After receiving delayed but newer version, it should update
    expect(storeB.get(hash)).toMatchObject({ data: 'delayed-newer' });
  });
});
