/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { MutationPersistencePolicy } from './mutation-persistence-policy';

import 'fake-indexeddb/auto';

interface QueuedMutation<T> {
  url: string;
  body: T | undefined;
  key: string | number;
  method: 'POST' | 'PUT' | 'DELETE';
}

// --- Mocks ---

function createMockStorage() {
  let storage: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(storage);

      return keys[index] || null;
    }),
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      storage = {};
    }),
    __getInternalStorage: () => storage, // for internal test debugging
  };
}

function createMockQueue<T>() {
  let queue: QueuedMutation<T>[] = [];

  return {
    getQueueSnapshot: () => [...queue],
    restoreQueue: (items: QueuedMutation<T>[]) => {
      queue = [...items];
    },
    replayQueue: vi.fn(() => Promise.resolve()),
    __getInternalQueue: () => queue, // for debugging
  };
}

// --- Tests ---

describe('MutationPersistencePolicy with LocalStorage', () => {
  let storage: ReturnType<typeof createMockStorage>;
  let queue: ReturnType<typeof createMockQueue<any>>;

  beforeEach(() => {
    storage = createMockStorage();
    queue = createMockQueue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves the queue to storage on mutation change', async () => {
    const policy = new MutationPersistencePolicy<any>({
      storage,
      key: 'mutation-queue',
      getQueueSnapshot: () => [
        { key: 1, url: '/api', method: 'POST', body: { name: 'Alice' } },
      ],
      restoreQueue: queue.restoreQueue,
      replayQueue: queue.replayQueue,
    });

    // Trigger a change
    await policy.onChange(1, { name: 'Alice' });

    expect(storage.setItem).toHaveBeenCalledTimes(1);

    const savedData = JSON.parse(storage.setItem.mock.calls[0][1]);

    expect(savedData).toEqual([
      { key: 1, url: '/api', method: 'POST', body: { name: 'Alice' } },
    ]);
  });

  it('loads the queue from storage and restores it', async () => {
    const savedQueue = [
      { key: 2, url: '/api/2', method: 'PUT', body: { name: 'Bob' } },
    ];

    storage.getItem.mockReturnValueOnce(JSON.stringify(savedQueue));

    const policy = new MutationPersistencePolicy<any>({
      storage,
      key: 'mutation-queue',
      getQueueSnapshot: queue.getQueueSnapshot,
      restoreQueue: queue.restoreQueue,
      replayQueue: queue.replayQueue,
    });

    await policy.onAttach({} as any); // store is not used here

    expect(queue.__getInternalQueue()).toEqual(savedQueue);
  });

  it('calls replayQueue after restoring mutations', async () => {
    const savedQueue = [
      { key: 3, url: '/api/3', method: 'DELETE', body: undefined },
    ];

    storage.getItem.mockReturnValueOnce(JSON.stringify(savedQueue));

    const policy = new MutationPersistencePolicy<any>({
      storage,
      key: 'mutation-queue',
      getQueueSnapshot: queue.getQueueSnapshot,
      restoreQueue: queue.restoreQueue,
      replayQueue: queue.replayQueue,
    });

    await policy.onAttach({} as any); // store is not used here

    expect(queue.replayQueue).toHaveBeenCalledTimes(1);
  });

  it('does not throw if storage is empty', async () => {
    storage.getItem.mockReturnValueOnce(null);

    const policy = new MutationPersistencePolicy<any>({
      storage,
      key: 'mutation-queue',
      getQueueSnapshot: queue.getQueueSnapshot,
      restoreQueue: queue.restoreQueue,
      replayQueue: queue.replayQueue,
    });

    policy.onAttach({} as any);

    expect(queue.replayQueue).not.toHaveBeenCalled(); // no queue to replay
  });
});

describe('MutationPersistencePolicy with IndexedDB', () => {
  let queue: ReturnType<typeof createMockQueue<any>>;

  beforeEach(() => {
    queue = createMockQueue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves and loads queue using IndexedDB', async () => {
    const policy = new MutationPersistencePolicy<any>({
      storage: 'indexeddb',
      key: 'mutation-queue',
      getQueueSnapshot: () => [
        { key: 1, url: '/api/1', method: 'POST', body: { name: 'Test User' } },
      ],
      restoreQueue: queue.restoreQueue,
      replayQueue: queue.replayQueue,
    });

    await policy.onChange(1, { name: 'Test User' });

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Now create a new policy to simulate page reload
    const restorePolicy = new MutationPersistencePolicy<any>({
      storage: 'indexeddb',
      key: 'mutation-queue',
      getQueueSnapshot: queue.getQueueSnapshot,
      restoreQueue: queue.restoreQueue,
      replayQueue: queue.replayQueue,
    });

    await restorePolicy.onAttach({} as any);

    expect(queue.__getInternalQueue()).toEqual([
      { key: 1, url: '/api/1', method: 'POST', body: { name: 'Test User' } },
    ]);

    expect(queue.replayQueue).toHaveBeenCalledTimes(1);
  });
});
