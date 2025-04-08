import { Store } from '../store/store';
import { Policy, FetchContext } from './policy';

interface ServiceWorkerFetchPolicyOptions {
  timeoutMs?: number;
  fallbackToNormalFetch?: boolean;
  urlBuilder: (ctx: FetchContext) => string;
}

export class ServiceWorkerFetchPolicy<T> extends Policy<T> {
  private timeoutMs: number;
  private fallbackToNormalFetch: boolean;
  private urlBuilder: (ctx: FetchContext) => string;

  constructor(options: ServiceWorkerFetchPolicyOptions) {
    super();
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.fallbackToNormalFetch = options.fallbackToNormalFetch ?? false;
    this.urlBuilder = options.urlBuilder;
  }

  onAttach(_store: Store<T>): void {
    // no setup needed
  }

  async fetch(ctx: FetchContext): Promise<T> {
    const url = this.urlBuilder(ctx);

    if (!navigator.serviceWorker?.controller) {
      if (this.fallbackToNormalFetch) {
        console.warn(
          '[ServiceWorkerFetchPolicy] No active Service Worker controller, falling back to normal fetch.',
        );

        const response = await fetch(url);

        return await response.json();
      } else {
        throw new Error('No active Service Worker controller.');
      }
    }

    const channel = new MessageChannel();

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Service Worker fetch timed out'));
      }, this.timeoutMs);

      channel.port1.onmessage = (event) => {
        clearTimeout(timeout);

        const { data } = event;

        if (
          !data ||
          (data.error && typeof data.error !== 'string') ||
          (!data.response && !data.error)
        ) {
          reject(new Error('Invalid response from Service Worker'));

          return;
        }

        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data.response as T);
        }
      };

      navigator.serviceWorker.controller?.postMessage(
        { type: 'FETCH_REQUEST', url },
        [channel.port2],
      );
    });
  }
}
