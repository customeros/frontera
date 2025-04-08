/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { Store } from '../store/store';
import { ServiceWorkerFetchPolicy } from './sw-fetch-policy';
import { mockMessageChannel } from '../test-util/mock-message-channel';

// --- Mock helpers ---

class MockServiceWorkerController {
  postMessage = vi.fn();
}

function createMockController() {
  const controller = new MockServiceWorkerController();

  // Fake the global navigator.serviceWorker
  Object.defineProperty(global.navigator, 'serviceWorker', {
    value: {
      controller,
    },
    configurable: true,
  });

  return controller;
}

function createTestPolicy(fallbackToNormalFetch = false) {
  return new ServiceWorkerFetchPolicy<any>({
    timeoutMs: 5000,
    fallbackToNormalFetch,
    urlBuilder: ({ key }) => `/api/users/${key}`,
  });
}

// --- Tests ---

describe('ServiceWorkerFetchPolicy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (global.navigator as any).serviceWorker;
    vi.restoreAllMocks();
  });

  it('throws if no Service Worker controller and fallback disabled', async () => {
    const policy = createTestPolicy();
    const store = new Store();

    await expect(policy.fetch({ store, key: 123 })).rejects.toThrow(
      'No active Service Worker controller.',
    );
  });

  it('falls back to normal fetch if no Service Worker and fallback enabled', async () => {
    delete (global.navigator as any).serviceWorker;

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 123 }),
      } as Response),
    );

    const policy = createTestPolicy(true); // fallback enabled
    const store = new Store();

    const result = await policy.fetch({ store, key: 123 });

    expect(result).toEqual({ id: 123 });
  });

  it('sends a postMessage and resolves with response', async () => {
    const controller = createMockController();
    const policy = createTestPolicy();
    const store = new Store();

    const { triggerServiceWorkerResponse } = mockMessageChannel();

    (controller.postMessage as any).mockImplementation(
      (_message: any, _ports: any[]) => {
        setTimeout(() => {
          triggerServiceWorkerResponse({ response: { id: 123 } });
        }, 1000);
      },
    );

    const promise = policy.fetch({ store, key: 123 });

    vi.advanceTimersByTime(1000);

    const result = await promise;

    expect(result).toEqual({ id: 123 });
  });

  it('times out if no response from Service Worker', async () => {
    const controller = createMockController();
    const policy = createTestPolicy();
    const store = new Store();

    const { triggerServiceWorkerTimeout } = mockMessageChannel(); // needed even if no response is sent

    (controller.postMessage as any).mockImplementation(() => {
      triggerServiceWorkerTimeout();
    });

    const promise = policy.fetch({ store, key: 123 });

    vi.advanceTimersByTime(5000);

    await expect(promise).rejects.toThrow('Service Worker fetch timed out');
  });

  it('rejects on invalid Service Worker response', async () => {
    const controller = createMockController();
    const policy = createTestPolicy();
    const store = new Store();

    const { triggerServiceWorkerResponse } = mockMessageChannel();

    (controller.postMessage as any).mockImplementation(
      (_message: any, _ports: any[]) => {
        setTimeout(() => {
          triggerServiceWorkerResponse(null); // invalid response
        }, 1000);
      },
    );

    const promise = policy.fetch({ store, key: 123 });

    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow(
      'Invalid response from Service Worker',
    );
  });

  it('rejects if Service Worker responds with an error', async () => {
    const controller = createMockController();
    const policy = createTestPolicy();
    const store = new Store();

    const { triggerServiceWorkerError } = mockMessageChannel();

    (controller.postMessage as any).mockImplementation(
      (_message: any, _ports: any[]) => {
        setTimeout(() => {
          triggerServiceWorkerError('Something went wrong');
        }, 1000);
      },
    );

    const promise = policy.fetch({ store, key: 123 });

    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow('Something went wrong');
  });
});
