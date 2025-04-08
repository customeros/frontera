import { it, vi, expect, describe, beforeEach } from 'vitest';

import { View } from './view';
import { ViewStore } from './view-store';

describe('View + ViewStore', () => {
  let store: ViewStore;

  beforeEach(() => {
    store = new ViewStore();
  });

  describe('constructor', () => {
    it('should construct a new View and store its output in ViewStore', () => {
      const src = { a: 1 };
      const run = vi.fn(() => ['foo']);
      const view = new View(src, run, store);

      expect(view).toBeInstanceOf(View);
      expect(view).toHaveProperty('hash');
      expect(view).toHaveProperty('compute');
      expect(view).toHaveProperty('invalidate');
      expect(view).toHaveProperty('dispose');

      expect(run).toHaveBeenCalledOnce();
      expect(store.has(view.hash)).toBe(true);
      expect(view.value()).toEqual(['foo']);
    });
  });

  describe('invalidate()', () => {
    it('should re-run the `run` function and update the stored value', () => {
      const src = { a: 2 };
      let value = 1;
      const run = vi.fn(() => value);

      const view = new View(src, run, store);
      const hash = view.hash;

      value = 2;
      view.invalidate();

      expect(run).toHaveBeenCalledTimes(2);
      expect(view.hash).toBe(hash);
      expect(view.value()).toBe(2);
      expect(store.get(hash)).toBe(2);
    });
  });

  describe('store behavior', () => {
    it('should store different Views with different hashes', () => {
      const src1 = { a: 1 };
      const src2 = { a: 2 };
      const run1 = vi.fn(() => 'A');
      const run2 = vi.fn(() => 'B');

      const view1 = new View(src1, run1, store);
      const view2 = new View(src2, run2, store);

      expect(run1).toHaveBeenCalledOnce();
      expect(run2).toHaveBeenCalledOnce();
      expect(view1.hash).not.toBe(view2.hash);
      expect(view1.value()).toBe('A');
      expect(view2.value()).toBe('B');
    });

    it('should allow manual overwrite of a View value in the store', () => {
      const src = { x: 42 };
      const run = vi.fn(() => 'initial');
      const view = new View(src, run, store);

      store.set(view.hash, 'manual override');

      expect(view.value()).toBe('manual override');
    });

    it('should support deleting entries from the store', () => {
      const src = { a: 1 };
      const run = vi.fn(() => 123);
      const view = new View(src, run, store);

      expect(store.has(view.hash)).toBe(true);

      store.delete(view.hash);

      expect(store.has(view.hash)).toBe(false);
      expect(store.get(view.hash)).toBeUndefined();
    });

    it('should clear all entries from the store', () => {
      const view1 = new View({ a: 1 }, () => 'one', store);
      const view2 = new View({ a: 2 }, () => 'two', store);

      expect(store.has(view1.hash)).toBe(true);
      expect(store.has(view2.hash)).toBe(true);

      store.clear();

      expect(store.has(view1.hash)).toBe(false);
      expect(store.has(view2.hash)).toBe(false);
    });
  });

  describe('re-instantiation behavior', () => {
    it('should overwrite existing stored value when View is recreated with same src', () => {
      const src = { a: 1 };
      const run1 = vi.fn(() => 'one');
      const run2 = vi.fn(() => 'two');

      const view1 = new View(src, run1, store);
      const view2 = new View(src, run2, store);

      expect(view1.hash).toBe(view2.hash);
      expect(run1).toHaveBeenCalledOnce();
      expect(run2).toHaveBeenCalledOnce();
      expect(view2.value()).toBe('two');
      expect(store.get(view2.hash)).toBe('two');
    });
  });

  describe('value types', () => {
    it('should support storing structured values like arrays or objects', () => {
      const src = { filter: 'active' };
      const result = [{ id: 1 }, { id: 2 }];
      const run = vi.fn(() => result);

      const view = new View(src, run, store);

      expect(view.value()).toEqual(result);
    });
  });

  describe('dispose()', () => {
    it('should delete the value from store when disposed', () => {
      const src = { remove: true };
      const run = vi.fn(() => 42);

      const view = new View(src, run, store);

      expect(store.has(view.hash)).toBe(true);

      view.dispose();
      expect(store.has(view.hash)).toBe(false);
    });
  });
});
