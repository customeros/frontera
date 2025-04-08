/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { QueuedMutationPolicy } from './sw-queued-mutation-policy';
import { mockMessageChannel } from '../test-util/mock-message-channel';

// --- Mock helpers ---

class MockServiceWorkerController {
  postMessage = vi.fn();
}

type Message = { type: string; payload?: any };

function createMockController() {
  const controller = new MockServiceWorkerController();

  Object.defineProperty(global.navigator, 'serviceWorker', {
    value: {
      controller,
    },
    configurable: true,
  });

  return controller;
}

function createTestPolicy(method: 'POST' | 'PUT' | 'DELETE' = 'POST') {
  return new QueuedMutationPolicy<any>({
    urlBuilder: (key) => `/api/users/${key}`,
    method,
    timeoutMs: 5000,
  });
}

// --- Tests ---

describe('QueuedMutationPolicy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (global.navigator as any).serviceWorker;
    vi.restoreAllMocks();
  });

  it('sends a successful mutation and resolves', async () => {
    const controller = createMockController();
    const policy = createTestPolicy('PUT');

    const { triggerServiceWorkerResponse } = mockMessageChannel();

    (controller.postMessage as any).mockImplementation(
      (_message: Message, _ports: Transferable[]) => {
        setTimeout(() => {
          triggerServiceWorkerResponse({ success: true });
        }, 1000);
      },
    );

    const promise = policy.onChange(123, { id: 123, name: 'John Doe' });

    vi.advanceTimersByTime(1000);

    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects if Service Worker responds with an error', async () => {
    const controller = createMockController();
    const policy = createTestPolicy('POST');

    const { triggerServiceWorkerError } = mockMessageChannel();

    (controller.postMessage as any).mockImplementation(
      (_message: Message, _ports: Transferable[]) => {
        setTimeout(() => {
          triggerServiceWorkerError('Something went wrong');
        }, 1000);
      },
    );

    const promise = policy.onChange(456, { id: 456, name: 'Jane Doe' });

    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow('Something went wrong');
  });

  it('rejects if Service Worker sends invalid response', async () => {
    const controller = createMockController();
    const policy = createTestPolicy();

    const { triggerServiceWorkerResponse } = mockMessageChannel();

    (controller.postMessage as any).mockImplementation(
      (_message: Message, _ports: Transferable[]) => {
        setTimeout(() => {
          triggerServiceWorkerResponse(null); // invalid response
        }, 1000);
      },
    );

    const promise = policy.onChange(789, { id: 789, name: 'Invalid User' });

    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow(
      'Invalid response from Service Worker',
    );
  });

  it('rejects if Service Worker never responds (timeout)', async () => {
    const controller = createMockController();
    const policy = createTestPolicy();

    const { triggerServiceWorkerTimeout } = mockMessageChannel();

    (controller.postMessage as any).mockImplementation(() => {
      triggerServiceWorkerTimeout(); // no reply
    });

    const promise = policy.onChange(321, { id: 321, name: 'No Reply' });

    vi.advanceTimersByTime(5000); // advance to timeout

    await expect(promise).rejects.toThrow('Service Worker mutation timeout');
  });

  it('logs an error if no Service Worker controller', async () => {
    delete (global.navigator as any).serviceWorker;

    const policy = createTestPolicy();

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const result = await policy.onChange(999, { id: 999, name: 'No SW' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[QueuedMutationPolicy] No active Service Worker controller.',
    );

    expect(result).toBeUndefined();

    consoleErrorSpy.mockRestore();
  });
});
