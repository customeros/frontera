import { it, expect, describe } from 'vitest';
import { runInAction, ObservableMap } from 'mobx';

import { Store } from './store';

describe('Store class', () => {
  describe('constructor', () => {
    const store = new Store();

    it('should create an instance of Store when `new` is called', () => {
      expect(store).toBeInstanceOf(Store);
    });

    it('should have a cache property instance of Map', () => {
      expect(store).toHaveProperty('cache');
      expect(store.cache).instanceOf(Map);
    });

    it('should have an option to specify the internal cache constructor', () => {
      const store = new Store({ cache: ObservableMap });

      expect(store.cache).toBeInstanceOf(ObservableMap);
    });

    it('should have an option to specify the internal mutator', () => {
      const store = new Store({ mutator: runInAction });

      expect(store.mutator).toBe(runInAction);
    });
  });

  describe('add entries', () => {
    const store = new Store();

    const value = { id: 'a', a: 1 };

    store.set(value.id, value);

    it('should have a method of adding new entries in cache', () => {
      expect(store.cache.has(value.id)).toBe(true);
    });
    it('should maintain the same reference for value once added in cache', () => {
      expect(store.cache.get(value.id)).toBe(value);
    });

    it('should overwrite an existing entry with a new value if the same key is provided', () => {
      const newValue = { id: 'a', a: 1 };

      store.set(newValue.id, newValue);

      expect(store.cache.has(newValue.id)).toBe(true);
      expect(store.cache.get(newValue.id)).not.toBe(value);
    });
  });
  describe('get entries', () => {
    const store = new Store();
    const value = { id: 'a', a: 1 };

    store.set(value.id, value);

    it('should have a method of getting entries from cache', () => {
      expect(store).toHaveProperty('get');
      expect(store.get).toBeDefined();
      expect(store.get(value.id)).toBe(value);
    });
    it('should return undefined if the entry does not exist', () => {
      expect(store.get('random')).toBeUndefined();
    });
  });
  describe('delete entries', () => {
    const store = new Store();
    const value = { id: 'a', a: 1 };

    store.set(value.id, value);

    expect(store.cache.has(value.id)).toBe(true);

    it('should have a method of deleting entries from cache', () => {
      expect(store).toHaveProperty('delete');
      expect(store.delete).toBeDefined();
    });
    it('should return true if the entry was deleted', () => {
      expect(store.delete(value.id)).toBe(true);
      expect(store.cache.has(value.id)).toBe(false);
    });
    it('should return false if the entry does not exist', () => {
      expect(store.delete('random')).toBe(false);
    });
  });
});
