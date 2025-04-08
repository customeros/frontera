import { Channel } from 'phoenix';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { View } from './view';
import { ViewStore } from './view-store';
import { PhoenixMap } from '../map/phoenix-map';

describe('View + PhoenixMap integration', () => {
  let pushSpy: ReturnType<typeof vi.fn>;
  let channel: Channel;
  let phoenixMap: PhoenixMap<number, unknown>;
  let store: ViewStore;

  beforeEach(() => {
    pushSpy = vi.fn();

    channel = {
      push: pushSpy,
      on: vi.fn(() => 0),
      off: vi.fn(),
    } as unknown as Channel;

    phoenixMap = new PhoenixMap(channel, {
      versionBy: undefined,
    });

    store = new ViewStore({
      cache: () => phoenixMap,
    });
  });

  it('should store view output into PhoenixMap and call channel.push', () => {
    const src = { active: true };
    const run = vi.fn(() => ['hello', 'world']);

    const view = new View(src, run, store);

    expect(view.value()).toEqual(['hello', 'world']);
    expect(phoenixMap.has(view.hash)).toBe(true);

    expect(pushSpy).toHaveBeenCalledWith('store:set', {
      type: 'store:set',
      key: view.hash,
      value: ['hello', 'world'],
      source: expect.any(String),
    });
  });

  it('should push updated value on invalidate()', () => {
    const src = { tag: 'react' };
    let result = ['initial'];
    const run = vi.fn(() => result);

    const view = new View(src, run, store);

    result = ['updated'];
    view.invalidate();

    expect(view.value()).toEqual(['updated']);

    const lastPush = pushSpy.mock.calls.at(-1)?.[1];

    expect(lastPush).toMatchObject({
      type: 'store:set',
      key: view.hash,
      value: ['updated'],
    });
  });

  it('should delete entry from PhoenixMap on dispose()', () => {
    const src = { tag: 'delete' };
    const run = vi.fn(() => 123);

    const view = new View(src, run, store);

    expect(phoenixMap.has(view.hash)).toBe(true);

    view.dispose();

    expect(phoenixMap.has(view.hash)).toBe(false);
  });
});
