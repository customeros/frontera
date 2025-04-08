import { Policy } from './policy';
import { Store } from '../store/store';

interface QueuedMutationPolicyOptions<T> {
  timeoutMs?: number;
  method?: 'POST' | 'PUT' | 'DELETE';
  urlBuilder: (key: string | number, value: T | undefined) => string;
}

interface QueuedMutation<T> {
  url: string;
  body: T | undefined;
  key: string | number;
  method: 'POST' | 'PUT' | 'DELETE';
}

export class QueuedMutationPolicy<T> extends Policy<T> {
  private urlBuilder: (key: string | number, value: T | undefined) => string;
  private method: 'POST' | 'PUT' | 'DELETE';
  private timeoutMs: number;
  private queue: QueuedMutation<T>[] = [];

  constructor(options: QueuedMutationPolicyOptions<T>) {
    super();
    this.urlBuilder = options.urlBuilder;
    this.method = options.method ?? 'POST';
    this.timeoutMs = options.timeoutMs ?? 5000;
  }

  getQueueSnapshot() {
    return this.queue.slice(); // Safe copy
  }

  restoreQueue(items: QueuedMutation<T>[]) {
    this.queue = items;
  }

  onAttach(_store: Store<T>): void {
    // TODO: replay queued mutations
  }

  async onChange(key: string | number, value: T | undefined): Promise<void> {
    if (!navigator.serviceWorker?.controller) {
      console.error(
        '[QueuedMutationPolicy] No active Service Worker controller.',
      );

      this.queue.push({
        key,
        url: this.urlBuilder(key, value),
        method: value === undefined ? 'DELETE' : this.method,
        body: value,
      });

      return;
    }

    const isDelete = value === undefined;
    const method = isDelete ? 'DELETE' : this.method;
    const url = this.urlBuilder(key, value);

    const channel = new MessageChannel();

    const promise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Service Worker mutation timeout'));
      }, this.timeoutMs);

      channel.port1.onmessage = (event) => {
        clearTimeout(timeout);

        const { data } = event;

        if (
          !data ||
          (data.error && typeof data.error !== 'string') ||
          (!data.success && !data.error)
        ) {
          // Invalid or missing success/error field
          this.queue.push({ key, url, method, body: value });
          reject(new Error('Invalid response from Service Worker'));

          return;
        }

        if (data.error) {
          // Service Worker reported error
          this.queue.push({ key, url, method, body: value });
          reject(new Error(data.error));
        } else {
          // Success
          resolve();
        }
      };
    });

    navigator.serviceWorker.controller.postMessage(
      {
        type: 'MUTATION_REQUEST',
        payload: {
          key,
          url,
          method,
          body: isDelete ? undefined : value,
        },
      },
      [channel.port2],
    );

    return promise;
  }

  async replayQueue(): Promise<void> {
    if (!navigator.serviceWorker?.controller) {
      console.warn(
        '[QueuedMutationPolicy] No active Service Worker controller to replay.',
      );

      return;
    }

    const pending = [...this.queue];

    this.queue = []; // Clear queue before retrying

    for (const mutation of pending) {
      const { key, url, method, body } = mutation;

      try {
        const channel = new MessageChannel();

        const promise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Service Worker mutation timeout'));
          }, this.timeoutMs);

          channel.port1.onmessage = (event) => {
            clearTimeout(timeout);

            const { data } = event;

            if (
              !data ||
              (data.error && typeof data.error !== 'string') ||
              (!data.success && !data.error)
            ) {
              reject(new Error('Invalid response from Service Worker'));

              return;
            }

            if (data.error) {
              reject(new Error(data.error));
            } else {
              resolve();
            }
          };
        });

        navigator.serviceWorker.controller.postMessage(
          {
            type: 'MUTATION_REQUEST',
            payload: {
              key,
              url,
              method,
              body,
            },
          },
          [channel.port2],
        );

        await promise; // Wait for one mutation at a time
      } catch (error) {
        console.warn(
          '[QueuedMutationPolicy] Failed to replay mutation',
          mutation,
          error,
        );
        this.queue.push(mutation); // Re-queue if still failing
      }
    }
  }
}
