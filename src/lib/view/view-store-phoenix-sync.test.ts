/* eslint-disable @typescript-eslint/ban-types */
import { Channel } from 'phoenix';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { View } from './view';
import { ViewStore } from './view-store';
import { PhoenixMap, PhoenixStoreEvent } from '../map/phoenix-map';

describe('ViewStore + PhoenixMap cross-instance sync', () => {
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

        return Math.floor(Math.random() * 100); // fake ref
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

  beforeEach(() => {
    eventBus = [];
  });

  it('should sync data across two PhoenixMap-backed ViewStores', () => {
    const chanA = createChannel(() => {});
    const storeA = new ViewStore({
      cache: () => new PhoenixMap(chanA.channel),
    });

    const chanB = createChannel(() => {});
    const storeB = new ViewStore({
      cache: () => new PhoenixMap(chanB.channel),
    });

    eventBus[0] = (topic, payload) => {
      chanB.handlers[topic]?.(payload);
    };

    eventBus[1] = (topic, payload) => {
      chanA.handlers[topic]?.(payload);
    };

    const src = { scope: 'shared' };
    const run = vi.fn(() => ['initial']);

    const viewA = new View(src, run, storeA);

    expect(storeB.has(viewA.hash)).toBe(true);
    expect(storeB.get(viewA.hash)).toEqual(['initial']);
  });

  it('should propagate changes from one View to the other', () => {
    const chanA = createChannel(() => {});
    const storeA = new ViewStore({
      cache: () => new PhoenixMap(chanA.channel),
    });

    const chanB = createChannel(() => {});
    const storeB = new ViewStore({
      cache: () => new PhoenixMap(chanB.channel),
    });

    eventBus[0] = (topic, payload) => {
      chanB.handlers[topic]?.(payload);
    };

    eventBus[1] = (topic, payload) => {
      chanA.handlers[topic]?.(payload);
    };

    const src = { category: 'sync-test' };
    let value = ['start'];
    const run = vi.fn(() => value);

    const viewA = new View(src, run, storeA);

    expect(storeB.get(viewA.hash)).toEqual(['start']);

    // Invalidate in A
    value = ['updated'];
    viewA.invalidate();

    expect(storeB.get(viewA.hash)).toEqual(['updated']);
  });
});
