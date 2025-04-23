/* eslint-disable @typescript-eslint/no-explicit-any */
import { Channel } from 'phoenix';
import { runInAction } from 'mobx';

import { Policy } from './policy';
import { Store } from '../store/store';

export type PhoenixStoreEvent =
  | { key: any; value: any; source: string; type: 'store:set' }
  | { key: any; source: string; type: 'store:delete' }
  | { source: string; type: 'store:clear' }
  | { key: any; source: string; type: 'store:invalidate' };

export class RealtimePolicy<T> extends Policy<T> {
  private readonly clientId = crypto.randomUUID();
  private readonly pendingFetches = new Map<string | number, Promise<void>>();
  private guardDisposer?: () => void;
  private isSyncSuspended = false;
  private handlers: number[] = [];
  private hasAttached: boolean = false;

  constructor(
    private channel: Channel | (() => Channel | null | undefined),
    private options?: {
      versionBy?: keyof T;
      skipIfNoChannel?: boolean;
      onEvent?: (payload: PhoenixStoreEvent) => void;
      fetchOnInvalidate?: (id: string | number) => Promise<T>;
      whenReady?: (cb: (ready: boolean) => void) => () => void;
    },
  ) {
    super();
  }

  onAttach(store: Store<T>): void {
    const attachHandlers = () => {
      if (this.hasAttached) return;
      this.hasAttached = true;

      const channel = this.getChannel();

      if (!channel) {
        console.warn(
          '[RealtimePolicy][onAttach] Skipping: no channel available.',
        );

        return;
      }

      this.handlers.push(
        channel.on(
          'store:set',
          (payload: PhoenixStoreEvent & { value: T; type: 'store:set' }) => {
            if (payload.source === this.clientId) return;

            const version = this.getVersion(payload.value);
            const current = store.get(payload.key);
            const currentVersion = current ? this.getVersion(current) ?? 0 : 0;

            if (version === undefined || version >= currentVersion) {
              runInAction(() => {
                this.suspendSync(() => {
                  store.set(payload.key, payload.value);
                });
              });

              this.options?.onEvent?.(payload);
            }
          },
        ),
      );

      this.handlers.push(
        channel.on(
          'store:delete',
          (payload: PhoenixStoreEvent & { type: 'store:delete' }) => {
            if (payload.source !== this.clientId) {
              runInAction(() => {
                this.suspendSync(() => {
                  store.delete(payload.key);
                });
              });

              this.options?.onEvent?.(payload);
            }
          },
        ),
      );

      this.handlers.push(
        channel.on(
          'store:clear',
          (payload: PhoenixStoreEvent & { type: 'store:clear' }) => {
            if (payload.source !== this.clientId) {
              runInAction(() => {
                this.suspendSync(() => {
                  store.clear();
                });
              });

              this.options?.onEvent?.(payload);
            }
          },
        ),
      );

      if (this.options?.fetchOnInvalidate) {
        this.handlers.push(
          channel.on(
            'store:invalidate',
            async (
              payload: PhoenixStoreEvent & { type: 'store:invalidate' },
            ) => {
              if (payload.source === this.clientId) return;
              if (this.pendingFetches.has(payload.key)) return;

              const fetchStartedAt = Date.now();

              const fetchPromise = this.options?.fetchOnInvalidate!(payload.key)
                .then((fetched) => {
                  const version = this.getVersion(fetched);
                  const current = store.get(payload.key);
                  const currentVersion = current
                    ? this.getVersion(current) ?? 0
                    : 0;

                  if (
                    (version !== undefined &&
                      version > currentVersion &&
                      fetchStartedAt > currentVersion) ||
                    version === undefined
                  ) {
                    runInAction(() => {
                      this.suspendSync(() => {
                        store.set(payload.key, fetched);
                      });
                    });

                    this.options?.onEvent?.(payload);
                  }
                })
                .finally(() => {
                  this.pendingFetches.delete(payload.key);
                });

              fetchPromise &&
                this.pendingFetches.set(payload.key, fetchPromise);
            },
          ),
        );
      }

      channel
        .join()
        .receive('ok', () => {
          console.info('[RealtimePolicy] Channel joined successfully');
        })
        .receive('error', (reason) => {
          console.error('[RealtimePolicy] Channel join error', reason);
        });
    };

    if (this.options?.whenReady) {
      this.guardDisposer = this.options.whenReady((ready) => {
        if (ready) attachHandlers();
      });
    } else {
      attachHandlers();
    }
  }

  onChange(key: string | number, value: T | undefined) {
    if (this.isSyncSuspended) return;
    const channel = this.getChannel();

    if (!channel) {
      console.warn('[RealtimePolicy][onChange] Skipping: No channel available');

      return;
    }

    if (value !== undefined) {
      channel.push('store:set', {
        type: 'store:set',
        key,
        value,
        source: this.clientId,
      });
    } else {
      channel.push('store:delete', {
        type: 'store:delete',
        key,
        source: this.clientId,
      });
    }
  }

  suspendSync(fn: () => void) {
    const wasSuspended = this.isSyncSuspended;

    this.isSyncSuspended = true;

    try {
      fn();
    } finally {
      this.isSyncSuspended = wasSuspended;
    }
  }

  private getVersion(value: T | undefined): number | undefined {
    const field = this.options?.versionBy;

    if (!field || typeof value !== 'object' || value === null) {
      return undefined;
    }

    const raw = (value as any)[field];

    if (typeof raw === 'string') {
      return new Date(raw).getTime();
    }

    return typeof raw === 'number' ? raw : undefined;
  }

  private getChannel(): Channel | null {
    const chan =
      typeof this.channel === 'function' ? this.channel() : this.channel;
    const skip =
      typeof this.options?.skipIfNoChannel === 'undefined'
        ? true
        : this.options?.skipIfNoChannel;

    if (!chan) {
      if (skip) {
        console.warn('[RealtimePolicy] Failed to resolve channel');
      } else {
        throw new Error('[RealtimePolicy] Failed to resolve channel');
      }
    }

    return chan ?? null;
  }

  onDetach() {
    this.guardDisposer?.();
    this.hasAttached = false;
    this.guardDisposer = undefined;

    const channel = this.getChannel();

    if (!channel) {
      console.warn('[RealtimePolicy][onDetach] Skipping: No channel available');

      return;
    }

    for (const ref of this.handlers) {
      channel.off('store:set', ref);
      channel.off('store:delete', ref);
      channel.off('store:clear', ref);
      channel.off('store:invalidate', ref);
    }

    this.handlers = [];
  }
}
