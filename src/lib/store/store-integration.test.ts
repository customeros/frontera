/* eslint-disable @typescript-eslint/ban-types */
import type { Channel } from 'phoenix';

import { autorun, runInAction } from 'mobx';
import { vi, it, Mock, expect, describe, beforeEach } from 'vitest';

import { Store } from './store';
import { PhoenixMap } from '../map/phoenix-map';

const createChannelMock = (handlers: Record<string, Function>) => {
  return {
    push: vi.fn(),
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
};

describe('Store - general integrations', () => {
  let channelMock: Channel;
  let handlers: Record<string, Function>;
  let store: Store<object>;

  beforeEach(() => {
    handlers = {};

    channelMock = createChannelMock(handlers);

    store = new Store<Entity>({
      cache: () => new PhoenixMap(channelMock),
      mutator: runInAction,
    });
  });

  it('should init', () => {
    expect(store).toBeInstanceOf(Store);
  });

  it('should have PhoenixMap as cache instance', () => {
    expect(store.cache).toBeInstanceOf(PhoenixMap);
  });

  it('should push to channel and store the value on add()', () => {
    store.set('key1', { foo: 'baz' });

    expect(channelMock.push).toHaveBeenCalledWith(
      'store:set',
      expect.objectContaining({
        key: 'key1',
        value: { foo: 'baz' },
        type: 'store:set',
        source: expect.any(String),
      }),
    );
  });

  it('should push to channel and delete the value on delete()', () => {
    store.set('key2', { bar: 'baz' });
    store.delete('key2');

    expect(channelMock.push).toHaveBeenCalledWith(
      'store:delete',
      expect.objectContaining({
        key: 'key2',
        type: 'store:delete',
        source: expect.any(String),
      }),
    );

    expect(store.get('key2')).toBeUndefined();
  });

  it('should apply external store:set event', () => {
    handlers['store:set']({
      key: 'remoteKey',
      value: { foo: 'boo' },
      type: 'store:set',
      source: 'another-client',
    });

    expect(store.get('remoteKey')).toStrictEqual({ foo: 'boo' });
  });

  it('should ignore self store:set event', () => {
    store.set('localKey', { a: 'b' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientId = (store.cache as any).clientId;

    handlers['store:set']({
      key: 'localKey',
      value: { foo: 'baz' },
      type: 'store:set',
      source: clientId,
    });

    expect(store.get('localKey')).toStrictEqual({ a: 'b' });
  });

  it('should apply external store:delete event', () => {
    store.set('toDelete', { a: 'c' });
    handlers['store:delete']({
      key: 'toDelete',
      type: 'store:delete',
      source: 'someone-else',
    });

    expect(store.get('toDelete')).toBeUndefined();
  });

  it('should apply external store:clear event', () => {
    store.set('k1', { a: 'a' });
    store.set('k2', { b: 'b' });

    handlers['store:clear']({
      type: 'store:clear',
      source: 'someone-else',
    });

    expect(store.get('k1')).toBeUndefined();
    expect(store.get('k2')).toBeUndefined();
  });

  it('should call channel.off() for all events on destroy()', () => {
    const map = store.cache as PhoenixMap;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refs = (map as any).handleRefs;

    map.destroy();

    expect(channelMock.off).toHaveBeenCalledWith(
      'store:set',
      refs['store:set'],
    );
    expect(channelMock.off).toHaveBeenCalledWith(
      'store:delete',
      refs['store:delete'],
    );
    expect(channelMock.off).toHaveBeenCalledWith(
      'store:clear',
      refs['store:clear'],
    );
  });

  it('should not track deep mutations unless explicitly updated', () => {
    const obj = { nested: 'value' };

    store.set('deep', obj);

    obj.nested = 'changed';

    expect(store.get('deep')).toEqual({ nested: 'value' });
  });

  it('should react to observable changes via MobX', () => {
    const observed: [string | number, object][] = [];

    autorun(() => {
      observed.length = 0;

      for (const [key, value] of store.cache.entries()) {
        observed.push([key, value]);
      }
    });

    store.set('x', { a: 'b' });
    expect(observed).toContainEqual(['x', { a: 'b' }]);
  });

  it.each([
    ['id1', { foo: 'bar' }],
    ['num', { a: 1 }],
    ['obj', { key: 'value' }],
  ])('should store and retrieve %p → %p', (key, value) => {
    store.set(key, value);
    expect(store.get(key)).toEqual(value);
  });
});

interface Entity {
  id: string;
  value: unknown;
  updatedAt: number;
}

describe('Store - invalidate integrations', () => {
  let channelMock: Channel;
  let handlers: Record<string, Function>;
  let store: Store<Entity>;
  let spy: Mock;

  beforeEach(() => {
    handlers = {};
    channelMock = createChannelMock(handlers);
    store = new Store<Entity>({
      cache: () =>
        new PhoenixMap(channelMock, {
          fetchOnInvalidate: spy,
          versionBy: 'updatedAt',
        }),
      mutator: runInAction,
    });
  });

  it('should init', () => {
    expect(store).toBeInstanceOf(Store);
  });

  it('should call fetchOnInvalidate when store:invalidate is received', async () => {
    spy = vi.fn().mockResolvedValue({
      id: 'org1',
      value: 'updated',
      updatedAt: Date.now(),
    });

    store = new Store<Entity>({
      cache: () =>
        new PhoenixMap(channelMock, {
          fetchOnInvalidate: spy,
          versionBy: 'updatedAt',
        }),
      mutator: runInAction,
    });

    handlers['store:invalidate']?.({
      key: 'org1',
      source: 'remote',
      type: 'store:invalidate',
    });

    await new Promise((r) => setTimeout(r, 0));

    expect(spy).toHaveBeenCalledWith('org1');
  });

  it('should update store entry if fetched version is newer', async () => {
    const now = Date.now();

    spy = vi.fn().mockResolvedValue({
      id: 'org2',
      value: 'new',
      updatedAt: now - 500,
    });

    store = new Store<Entity>({
      cache: () =>
        new PhoenixMap(channelMock, {
          fetchOnInvalidate: spy,
          versionBy: 'updatedAt',
        }),
      mutator: runInAction,
    });

    store.set('org2', { id: 'org2', value: 'old', updatedAt: now - 1000 });

    handlers['store:invalidate']?.({
      key: 'org2',
      source: 'remote',
      type: 'store:invalidate',
    });

    await new Promise((r) => setTimeout(r, 0));

    expect(store.get('org2')).toMatchObject({ value: 'new' });
  });
});
