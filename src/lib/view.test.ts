import { it, vi, expect, describe } from 'vitest';

import { View, ViewRegistry } from './view';

describe('View class', () => {
  describe('constructor', () => {
    const src = { a: 1 };
    const run = vi.fn(() => []);
    const view = new View(src, run);

    it('calling `new` should output an instance of View', () => {
      expect(view).toBeInstanceOf(View);
      expect(view).toHaveProperty('hash');
      expect(view).toHaveProperty('run');
      expect(view).toHaveProperty('invalidate');
    });
    it('should register new entry in ViewRegistry', () => {
      expect(ViewRegistry.has(view.hash)).toBe(true);
    });
    it('should call `run` callback once', () => {
      expect(run).toHaveBeenCalledOnce();
    });
  });

  describe('invalidate', () => {
    const src = { a: 2 };
    let value = 1;
    const run = vi.fn(() => value);

    const view = new View(src, run);
    const hash = view.hash;

    value = 2;
    view.invalidate();

    it('should execute `run` callback if called', () => {
      expect(run).toHaveBeenCalledTimes(2);
    });
    it('should replace the stored value while maintaining the same hash', () => {
      expect(view.hash).toBe(hash);
      expect(view.value()).toBe(value);
    });
    it('should replace the ViewRegistry entry if `run` returns a different value', () => {
      expect(ViewRegistry.get(hash)).toBe(value);
    });
  });
});
