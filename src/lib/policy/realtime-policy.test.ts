/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Channel } from 'phoenix';

import { Store } from '@/lib/store/store';
import { applyPolicies } from '@/lib/policy/apply';
import { RealtimePolicy } from '@/lib/policy/realtime-policy';
import { it, vi, expect, describe, beforeEach } from 'vitest';

interface Entity {
  id: string;
  name: string;
  updatedAt: number;
}

describe('RealtimePolicy sync', () => {
  let channelMock: Channel;
  let handlers: Record<string, Function>;
  let store: Store<Entity>;

  beforeEach(() => {
    handlers = {};

    channelMock = {
      push: vi.fn(),
      on: vi.fn((event, callback) => {
        handlers[event] = callback;

        return Math.floor(Math.random() * 100);
      }),
      off: vi.fn(),
      topic: 'test',
      state: 'joined',
      join: vi.fn(() => ({
        receive: vi.fn(() => ({
          receive: vi.fn(), // chain ok.error.receive()
        })),
      })),
      leave: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
      onMessage: vi.fn(),
    } as unknown as Channel;

    store = new Store<Entity>();
  });

  it('should attach RealtimePolicy and push set()', () => {
    const realtime = new RealtimePolicy<Entity>(channelMock);
    const liveStore = applyPolicies(store, [realtime]);

    liveStore.set('foo', { id: 'foo', name: 'Foo', updatedAt: 1 });

    expect(channelMock.push).toHaveBeenCalledWith(
      'store:set',
      expect.objectContaining({
        type: 'store:set',
        key: 'foo',
        value: expect.any(Object),
        source: expect.any(String),
      }),
    );
  });

  it('should attach RealtimePolicy and push delete()', () => {
    const realtime = new RealtimePolicy<Entity>(channelMock);
    const liveStore = applyPolicies(store, [realtime]);

    liveStore.set('foo', { id: 'foo', name: 'Foo', updatedAt: 1 });
    liveStore.delete('foo');

    expect(channelMock.push).toHaveBeenCalledWith(
      'store:delete',
      expect.objectContaining({
        type: 'store:delete',
        key: 'foo',
        source: expect.any(String),
      }),
    );
  });

  it('should apply external set from channel', () => {
    const realtime = new RealtimePolicy<Entity>(channelMock);
    const liveStore = applyPolicies(store, [realtime]);

    handlers['store:set']?.({
      type: 'store:set',
      key: 'bar',
      value: { id: 'bar', name: 'Bar', updatedAt: 2 },
      source: 'other-client',
    });

    expect(liveStore.get('bar')?.name).toBe('Bar');
  });

  it('should ignore own set messages', () => {
    const realtime = new RealtimePolicy<Entity>(channelMock);
    const liveStore = applyPolicies(store, [realtime]);

    // Simulate sending and receiving self-originated set
    liveStore.set('self', { id: 'self', name: 'Self', updatedAt: 1 });

    const clientId = (realtime as any).clientId;

    handlers['store:set']?.({
      type: 'store:set',
      key: 'self',
      value: { id: 'self', name: 'NewSelf', updatedAt: 2 },
      source: clientId,
    });

    expect(liveStore.get('self')?.name).toBe('Self'); // Should not overwrite
  });

  it('should apply external delete from channel', () => {
    const realtime = new RealtimePolicy<Entity>(channelMock);
    const liveStore = applyPolicies(store, [realtime]);

    liveStore.set('foo', { id: 'foo', name: 'Foo', updatedAt: 1 });

    handlers['store:delete']?.({
      type: 'store:delete',
      key: 'foo',
      source: 'other-client',
    });

    expect(liveStore.has('foo')).toBe(false);
  });

  it('should apply external clear from channel', () => {
    const realtime = new RealtimePolicy<Entity>(channelMock);
    const liveStore = applyPolicies(store, [realtime]);

    liveStore.set('a', { id: 'a', name: 'A', updatedAt: 1 });
    liveStore.set('b', { id: 'b', name: 'B', updatedAt: 2 });

    handlers['store:clear']?.({
      type: 'store:clear',
      source: 'other-client',
    });

    expect(liveStore.size).toBe(0);
  });

  it('should fetch and update on invalidate', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      id: 'org123',
      name: 'Fetched Org',
      updatedAt: 10,
    });

    const realtime = new RealtimePolicy<Entity>(channelMock, {
      fetchOnInvalidate: fetchFn,
    });

    const liveStore = applyPolicies(store, [realtime]);

    await handlers['store:invalidate']?.({
      type: 'store:invalidate',
      key: 'org123',
      source: 'another-client',
    });

    expect(fetchFn).toHaveBeenCalledWith('org123');
    expect(liveStore.get('org123')?.name).toBe('Fetched Org');
  });

  it('should ignore self-originated invalidate events', async () => {
    const fetchFn = vi.fn();

    const realtime = new RealtimePolicy<Entity>(channelMock, {
      fetchOnInvalidate: fetchFn,
    });

    const _liveStore = applyPolicies(store, [realtime]);

    const clientId = (realtime as any).clientId;

    await handlers['store:invalidate']?.({
      type: 'store:invalidate',
      key: 'org123',
      source: clientId,
    });

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('should call channel.off() on detach', () => {
    const realtime = new RealtimePolicy<Entity>(channelMock);
    const liveStore = applyPolicies(store, [realtime]);

    liveStore.destroy();

    expect(channelMock.off).toHaveBeenCalled();
  });

  it('should defer channel join and handler registration until whenReady is true', () => {
    let trigger: (val: boolean) => void = () => {};

    const observe = (cb: (val: boolean) => void) => {
      trigger = cb;

      return vi.fn(); // mock disposer
    };

    const realtime = new RealtimePolicy<Entity>(channelMock, {
      whenReady: observe,
    });

    applyPolicies(store, [realtime]);

    expect(channelMock.join).not.toHaveBeenCalled();

    // simulate readiness
    trigger(true);

    expect(channelMock.join).toHaveBeenCalled();
    expect(channelMock.on).toHaveBeenCalled();
  });

  it('should ignore external events before whenReady is triggered', () => {
    let trigger: (val: boolean) => void = () => {};

    const observe = (cb: (val: boolean) => void) => {
      trigger = cb;

      return vi.fn();
    };

    const realtime = new RealtimePolicy<Entity>(channelMock, {
      whenReady: observe,
    });

    const liveStore = applyPolicies(store, [realtime]);

    // try to inject event before ready
    handlers['store:set']?.({
      type: 'store:set',
      key: 'bar',
      value: { id: 'bar', name: 'Blocked', updatedAt: 2 },
      source: 'other-client',
    });

    expect(liveStore.has('bar')).toBe(false); // should be ignored

    // now trigger readiness
    trigger(true);

    // new event should work now
    handlers['store:set']?.({
      type: 'store:set',
      key: 'bar',
      value: { id: 'bar', name: 'Allowed', updatedAt: 3 },
      source: 'other-client',
    });

    expect(liveStore.get('bar')?.name).toBe('Allowed');
  });

  it('should clean up the whenReady observer on detach', () => {
    const disposer = vi.fn();
    const observe = (_: (val: boolean) => void) => disposer;

    const realtime = new RealtimePolicy<Entity>(channelMock, {
      whenReady: observe,
    });

    const liveStore = applyPolicies(store, [realtime]);

    liveStore.destroy();

    expect(disposer).toHaveBeenCalled();
  });
});
