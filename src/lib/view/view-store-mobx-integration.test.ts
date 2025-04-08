import { autorun, observable, runInAction } from 'mobx';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { View } from './view';
import { ViewStore } from './view-store';

describe('View + MobX observable.map cache', () => {
  let store: ViewStore;

  beforeEach(() => {
    store = new ViewStore({
      cache: () => observable.map<number, unknown>(),
      mutator: runInAction,
    });
  });

  it('should store the result in an observable map', () => {
    const src = { mobx: true };
    const run = vi.fn(() => 'hello');

    const view = new View(src, run, store);

    expect(store.has(view.hash)).toBe(true);
    expect(view.value()).toBe('hello');
  });

  it('should react to value changes via autorun', () => {
    const src = { user: 1 };
    let result = ['initial'];
    const run = vi.fn(() => result);

    const view = new View(src, run, store);

    let observed: unknown;
    const dispose = autorun(() => {
      observed = view.value();
    });

    expect(observed).toEqual(['initial']);

    result = ['updated'];
    view.invalidate();

    expect(observed).toEqual(['updated']);

    dispose();
  });

  it('should reflect deletion from the observable map', () => {
    const src = { shouldDelete: true };
    const run = vi.fn(() => 42);

    const view = new View(src, run, store);

    let exists = false;
    const dispose = autorun(() => {
      exists = store.has(view.hash);
    });

    expect(exists).toBe(true);

    view.dispose();

    expect(store.has(view.hash)).toBe(false);
    expect(exists).toBe(false);

    dispose();
  });
});
