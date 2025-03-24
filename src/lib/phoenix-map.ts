/* eslint-disable @typescript-eslint/no-explicit-any */
import { Channel } from 'phoenix';
import { runInAction, ObservableMap } from 'mobx';

type PhoenixStoreEvent =
  | { key: any; value: any; source: string; type: 'store:set' }
  | { key: any; source: string; type: 'store:delete' }
  | { source: string; type: 'store:clear' }
  | { key: any; source: string; type: 'store:invalidate' };

export class PhoenixMap<K = any, V = any> extends ObservableMap<K, V> {
  private channel: Channel;
  private readonly clientId: string;
  private readonly handleRefs = {
    'store:set': 0,
    'store:clear': 2,
    'store:delete': 1,
    'store:invalidate': 3,
  };

  private pendingFetches = new Map<K, Promise<void>>();
  private isSyncSuspended = false;

  constructor(
    channel: Channel,
    private options?: {
      versionBy?: keyof V;
      entries?: readonly (readonly [K, V])[];
      fetchOnInvalidate?: (id: K) => Promise<V>;
    },
  ) {
    super();
    this.channel = channel;
    this.clientId = crypto.randomUUID();

    if (options?.entries) {
      for (const [key, value] of options.entries) {
        runInAction(() => {
          super.set(key, value); // bypass sync
        });
      }
    }

    this.init();
  }

  suspendSync(fn: () => void) {
    this.isSyncSuspended = true;

    try {
      fn();
    } finally {
      this.isSyncSuspended = false;
    }
  }

  private getVersion(value: V): number | undefined {
    const field = this.options?.versionBy;

    return field && typeof value === 'object' && value !== null
      ? (value[field] as unknown as number)
      : undefined;
  }

  override set(key: K, value: V): this {
    const version = this.getVersion(value);

    if (version !== undefined) {
      const current = this.get(key);
      const currentVersion = current ? this.getVersion(current) ?? 0 : 0;

      if (version > currentVersion) {
        runInAction(() => {
          super.set(key, value);
        });
      } else {
        return this;
      }
    } else {
      runInAction(() => {
        super.set(key, value);
      });
    }

    if (!this.isSyncSuspended) {
      this.channel.push('store:set', {
        type: 'store:set',
        key,
        value,
        source: this.clientId,
      });
    }

    return this;
  }

  override delete(key: K): boolean {
    if (!this.isSyncSuspended) {
      this.channel.push('store:delete', {
        type: 'store:delete',
        key,
        source: this.clientId,
      });
    }

    let res: boolean = true;

    runInAction(() => {
      res = super.delete(key);
    });

    return res;
  }

  override clear(): void {
    if (!this.isSyncSuspended) {
      this.channel.push('store:clear', {
        type: 'store:clear',
        source: this.clientId,
      });
    }

    runInAction(() => {
      super.clear();
    });
  }

  private init() {
    this.handleRefs['store:set'] = this.channel.on(
      'store:set',
      ({
        key,
        value,
        source,
      }: PhoenixStoreEvent & { value: V; type: 'store:set' }) => {
        if (source === this.clientId) return;

        const version = this.getVersion(value);

        if (version !== undefined) {
          const current = this.get(key);
          const currentVersion = current ? this.getVersion(current) ?? 0 : 0;

          if (version > currentVersion) {
            runInAction(() => {
              super.set(key, value);
            });
          }
        } else {
          runInAction(() => {
            super.set(key, value);
          });
        }
      },
    );

    this.handleRefs['store:delete'] = this.channel.on(
      'store:delete',
      ({ key, source }: PhoenixStoreEvent & { type: 'store:delete' }) => {
        if (source !== this.clientId) {
          runInAction(() => {
            super.delete(key);
          });
        }
      },
    );

    this.handleRefs['store:clear'] = this.channel.on(
      'store:clear',
      ({ source }: PhoenixStoreEvent & { type: 'store:clear' }) => {
        if (source !== this.clientId) {
          runInAction(() => {
            super.clear();
          });
        }
      },
    );

    if (this.options?.fetchOnInvalidate) {
      this.handleRefs['store:invalidate'] = this.channel.on(
        'store:invalidate',
        async ({
          key,
          source,
        }: PhoenixStoreEvent & { type: 'store:invalidate' }) => {
          if (source === this.clientId) return;
          if (this.pendingFetches.has(key)) return;

          const fetchStartedAt = Date.now();

          const fetchPromise = this.options!.fetchOnInvalidate!(key)
            .then((fetched) => {
              const version = this.getVersion(fetched);
              const current = this.get(key);
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
                  super.set(key, fetched);
                });
              }
            })
            .finally(() => {
              this.pendingFetches.delete(key);
            });

          this.pendingFetches.set(key, fetchPromise);
        },
      );
    }
  }

  public getClientId() {
    return this.clientId;
  }

  destroy() {
    this.channel.off('store:set', this.handleRefs['store:set']);
    this.channel.off('store:delete', this.handleRefs['store:delete']);
    this.channel.off('store:clear', this.handleRefs['store:clear']);

    if (this.handleRefs['store:invalidate']) {
      this.channel.off('store:invalidate', this.handleRefs['store:invalidate']);
    }
  }
}
