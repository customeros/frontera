/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi } from 'vitest';

/**
 * Mocks the MessageChannel API for Service Worker communication.
 * Returns a manual trigger function to simulate Service Worker responses.
 */
export function mockMessageChannel() {
  let onMessageHandler: ((event: any) => void) | null = null;

  const fakePort1 = {
    set onmessage(handler: (event: any) => void) {
      onMessageHandler = handler;
    },
    postMessage: vi.fn(),
  };

  const fakePort2 = {};

  (global as any).MessageChannel = vi.fn(() => ({
    port1: fakePort1,
    port2: fakePort2,
  }));

  return {
    /**
     * Simulate the SW sending a response
     */
    triggerServiceWorkerResponse: (data: any) => {
      if (onMessageHandler) {
        onMessageHandler({ data });
      }
    },

    /**
     * Simulate the SW never responding (timeout)
     */
    triggerServiceWorkerTimeout: () => {
      // Just don't call anything -> rely on vi.advanceTimers to trigger timeout
    },

    /**
     * Simulate an immediate SW error (invalid message)
     */
    triggerServiceWorkerError: (errorMessage: string) => {
      if (onMessageHandler) {
        onMessageHandler({ data: { error: errorMessage } });
      }
    },
  };
}
