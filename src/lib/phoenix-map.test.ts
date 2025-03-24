/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Channel } from 'phoenix';

import { autorun } from 'mobx';
import { it, vi, Mock, expect, describe, beforeEach } from 'vitest';

import { PhoenixMap } from './phoenix-map';

describe('PhoenixMap sync', () => {
  let channelMock: Channel;
  // eslint-disable-next-line @typescript-eslint/ban-types
  let handlers: Record<string, Function>;

  beforeEach(() => {
    handlers = {};

    channelMock = {
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
  });

  it('should create an instance of PhoenixMap', () => {
    const map = new PhoenixMap(channelMock);

    expect(map).toBeInstanceOf(PhoenixMap);
  });

  it('should call channel.push() on set()', () => {
    const map = new PhoenixMap(channelMock);

    map.set('foo', 'bar');

    expect(channelMock.push).toHaveBeenCalledWith(
      'store:set',
      expect.objectContaining({
        type: 'store:set',
        key: 'foo',
        value: 'bar',
        source: expect.any(String),
      }),
    );
    expect(map.get('foo')).toBe('bar');
  });

  it('should call channel.push() on delete()', () => {
    const map = new PhoenixMap(channelMock);

    map.set('foo', 'bar'); // so it exists
    map.delete('foo');

    expect(channelMock.push).toHaveBeenCalledWith(
      'store:delete',
      expect.objectContaining({
        type: 'store:delete',
        key: 'foo',
        source: expect.any(String),
      }),
    );
    expect(map.has('foo')).toBe(false);
  });

  it('should call channel.push() on clear()', () => {
    const map = new PhoenixMap(channelMock);

    map.set('foo', 'bar');
    map.set('baz', 'qux');

    map.clear();

    expect(channelMock.push).toHaveBeenCalledWith(
      'store:clear',
      expect.objectContaining({
        type: 'store:clear',
        source: expect.any(String),
      }),
    );
    expect(map.size).toBe(0);
  });

  it('should apply external set messages', () => {
    const map = new PhoenixMap(channelMock);

    handlers['store:set']?.({
      type: 'store:set',
      key: 'a',
      value: 42,
      source: 'other-client-id',
    });

    expect(map.get('a')).toBe(42);
  });

  it('should ignore own set messages', () => {
    const map = new PhoenixMap(channelMock);
    const clientId = (map as any).clientId;

    handlers['store:set']?.({
      type: 'store:set',
      key: 'a',
      value: 999,
      source: clientId,
    });

    expect(map.get('a')).toBe(undefined);
  });

  it('should apply external delete messages', () => {
    const map = new PhoenixMap(channelMock);

    map.set('x', 'y');

    handlers['store:delete']?.({
      type: 'store:delete',
      key: 'x',
      source: 'someone-else',
    });

    expect(map.has('x')).toBe(false);
  });

  it('should apply external clear messages', () => {
    const map = new PhoenixMap(channelMock);

    map.set('a', 1);
    map.set('b', 2);

    handlers['store:clear']?.({
      type: 'store:clear',
      source: 'someone-else',
    });

    expect(map.size).toBe(0);
  });

  it('should call channel.off() with correct refs on destroy()', () => {
    const map = new PhoenixMap(channelMock);

    // Each on() returns a ref (number), we need to remember those for matching
    const setRef = (map as any).handleRefs['store:set'];
    const delRef = (map as any).handleRefs['store:delete'];
    const clrRef = (map as any).handleRefs['store:clear'];

    map.destroy();

    expect(channelMock.off).toHaveBeenCalledWith('store:set', setRef);
    expect(channelMock.off).toHaveBeenCalledWith('store:delete', delRef);
    expect(channelMock.off).toHaveBeenCalledWith('store:clear', clrRef);
  });

  it('should fetch and update entity on store:invalidate event', async () => {
    const fetchedOrg = { id: 'org-123', name: 'Acme Inc' };

    const fetchFn = vi.fn().mockResolvedValue(fetchedOrg);

    const map = new PhoenixMap(channelMock, {
      fetchOnInvalidate: fetchFn,
    });

    await handlers['store:invalidate']({
      type: 'store:invalidate',
      key: 'org-123',
      source: 'some-other-client',
    });

    expect(fetchFn).toHaveBeenCalledWith('org-123');
    expect(map.get('org-123')).toEqual(fetchedOrg);
  });

  it('should ignore self-originated store:invalidate event', async () => {
    const fetchFn = vi.fn();

    const map = new PhoenixMap(channelMock, {
      fetchOnInvalidate: fetchFn,
    });

    const clientId = map.getClientId();

    await handlers['store:invalidate']({
      type: 'store:invalidate',
      key: 'org-123',
      source: clientId,
    });

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('should suppress sync when suspendSync is used', () => {
    const map = new PhoenixMap<string, Entity>(channelMock, {
      versionBy: 'updatedAt',
    });

    map.suspendSync(() => {
      map.set('org1', { id: 'org1', name: 'silent1', updatedAt: 1 });
      map.set('org2', { id: 'org2', name: 'silent2', updatedAt: 2 });
      map.delete('org1');
      map.clear();
    });

    const pushCalls = (channelMock.push as Mock).mock.calls.map(
      ([event]) => event,
    );

    expect(pushCalls).not.toContain('store:set');
    expect(pushCalls).not.toContain('store:delete');
    expect(pushCalls).not.toContain('store:clear');
  });

  it('should still emit MobX reactions inside suspendSync', () => {
    const map = new PhoenixMap<string, Entity>(channelMock, {
      versionBy: 'updatedAt',
    });
    const seen: string[] = [];

    autorun(() => {
      seen.length = 0;

      for (const entry of map.entries()) {
        seen.push(entry[0]);
      }
    });

    map.suspendSync(() => {
      map.set('orgA', { id: 'orgA', name: 'Alpha', updatedAt: 1 });
      map.set('orgB', { id: 'orgB', name: 'Beta', updatedAt: 2 });
    });

    expect(seen).toContain('orgA');
    expect(seen).toContain('orgB');
  });
});

interface Entity {
  id: string;
  name: string;
  updatedAt: number;
}

describe('PhoenixMap versioning', () => {
  let channelMock: Channel;
  // eslint-disable-next-line @typescript-eslint/ban-types
  let handlers: Record<string, Function>;
  let map: PhoenixMap<string, Entity>;

  beforeEach(() => {
    handlers = {};

    channelMock = {
      push: vi.fn(),
      on: vi.fn((event, cb) => {
        handlers[event] = cb;

        return Math.random();
      }),
      off: vi.fn(),
      join: vi.fn(),
      leave: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
      onMessage: vi.fn(),
      state: 'joined',
      topic: 'test',
    } as unknown as Channel;

    map = new PhoenixMap(channelMock, {
      versionBy: 'updatedAt',
    });
  });

  it('should accept versioned values and overwrite if newer', () => {
    map.set('org', { id: 'org', name: 'v1', updatedAt: 1 });
    map.set('org', { id: 'org', name: 'v2', updatedAt: 2 });

    expect(map.get('org')?.name).toBe('v2');
  });

  it('should ignore updates with same or older version', () => {
    map.set('org', { id: 'org', name: 'v5', updatedAt: 5 });
    map.set('org', { id: 'org', name: 'v3', updatedAt: 3 });

    expect(map.get('org')?.name).toBe('v5');
  });

  it('should treat missing versionBy as no versioning', () => {
    const plainMap = new PhoenixMap(channelMock);

    plainMap.set('org', { id: 'org', name: 'first', updatedAt: 10 });
    plainMap.set('org', { id: 'org', name: 'second', updatedAt: 5 });

    expect(plainMap.get('org')?.name).toBe('second');
  });

  it('should handle store:set with newer version remotely', () => {
    map.set('org', { id: 'org', name: 'v1', updatedAt: 1 });

    handlers['store:set']?.({
      type: 'store:set',
      key: 'org',
      value: { id: 'org', name: 'v3', updatedAt: 3 },
      source: 'remote',
    });

    expect(map.get('org')?.name).toBe('v3');
  });

  it('should ignore store:set with older remote version', () => {
    map.set('org', { id: 'org', name: 'latest', updatedAt: 10 });

    handlers['store:set']?.({
      type: 'store:set',
      key: 'org',
      value: { id: 'org', name: 'old', updatedAt: 5 },
      source: 'remote',
    });

    expect(map.get('org')?.name).toBe('latest');
  });

  it('should use fetchOnInvalidate only if not already pending', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ id: 'org', name: 'remote', updatedAt: 2 });

    map = new PhoenixMap(channelMock, {
      versionBy: 'updatedAt',
      fetchOnInvalidate: fetchMock,
    });

    handlers['store:invalidate']?.({
      key: 'org',
      source: 'other',
      type: 'store:invalidate',
    });
    handlers['store:invalidate']?.({
      key: 'org',
      source: 'other',
      type: 'store:invalidate',
    });

    await Promise.resolve(); // wait for promise microtasks

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should update with fetch result if newer', async () => {
    map.set('org', { id: 'org', name: 'old', updatedAt: 1 });

    map = new PhoenixMap(channelMock, {
      versionBy: 'updatedAt',
      fetchOnInvalidate: async () => ({
        id: 'org',
        name: 'fresh',
        updatedAt: 5,
      }),
    });

    handlers['store:invalidate']?.({
      key: 'org',
      source: 'another',
      type: 'store:invalidate',
    });

    await new Promise((r) => setTimeout(r, 0));
    expect(map.get('org')?.name).toBe('fresh');
  });

  it('should ignore fetch result if older', async () => {
    map.set('org', { id: 'org', name: 'current', updatedAt: 10 });

    map = new PhoenixMap(channelMock, {
      versionBy: 'updatedAt',
      fetchOnInvalidate: async () => ({
        id: 'org',
        name: 'stale',
        updatedAt: 5,
      }),
      entries: [['org', { id: 'org', name: 'current', updatedAt: 10 }]],
    });

    handlers['store:invalidate']?.({
      key: 'org',
      source: 'server',
      type: 'store:invalidate',
    });

    await new Promise((r) => setTimeout(r, 0));
    expect(map.get('org')?.name).toBe('current');
  });

  it('should overwrite with older value when versionBy is not set', () => {
    const plainMap = new PhoenixMap(channelMock);

    plainMap.set('org', { id: 'org', name: 'first', updatedAt: 10 });
    plainMap.set('org', { id: 'org', name: 'second', updatedAt: 5 });

    expect(plainMap.get('org')?.name).toBe('second'); // overwritten despite lower updatedAt
  });

  it('should apply remote set with lower version when versionBy is not set', () => {
    const plainMap = new PhoenixMap(channelMock);

    plainMap.set('org', { id: 'org', name: 'local', updatedAt: 10 });

    handlers['store:set']?.({
      type: 'store:set',
      key: 'org',
      value: { id: 'org', name: 'remote-lower', updatedAt: 2 },
      source: 'external-client',
    });

    expect(plainMap.get('org')?.name).toBe('remote-lower'); // allowed
  });

  it('should apply fetch result even if older when versionBy is not set', async () => {
    const plainMap = new PhoenixMap(channelMock, {
      fetchOnInvalidate: async () => ({
        id: 'org',
        name: 'fetched-old',
        updatedAt: 2,
      }),
      entries: [['org', { id: 'org', name: 'bootstrapped', updatedAt: 99 }]],
    });

    handlers['store:invalidate']?.({
      key: 'org',
      source: 'server',
      type: 'store:invalidate',
    });

    await new Promise((r) => setTimeout(r, 0));

    expect(plainMap.get('org')?.name).toBe('fetched-old');
  });
});
