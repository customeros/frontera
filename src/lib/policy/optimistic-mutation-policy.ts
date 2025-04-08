import { Policy } from './policy';
import { Store } from '../store/store';

interface OptimisticMutationPolicyOptions<T> {
  maxRetries?: number;
  retryDelayMs?: number;
  isRetryableError?: (error: unknown) => boolean;
  mutationFn: (key: string | number, value: T | undefined) => Promise<void>;
  onRetry?: (info: {
    attempt: number;
    delayMs: number;
    key: string | number;
  }) => void;
}

export class OptimisticMutationPolicy<T> extends Policy<T> {
  private mutationFn: (
    key: string | number,
    value: T | undefined,
  ) => Promise<void>;
  private isRetryableError?: (error: unknown) => boolean;
  private snapshots = new Map<string | number, T | undefined>();
  private store!: Store<T>;
  private maxRetries = 0;
  private retryDelayMs = 0;
  private onRetry?: (info: {
    attempt: number;
    delayMs: number;
    key: string | number;
  }) => void;

  constructor(options: OptimisticMutationPolicyOptions<T>) {
    super();
    this.mutationFn = options.mutationFn;
    this.maxRetries = options.maxRetries ?? 0;
    this.retryDelayMs = options.retryDelayMs ?? 0;
    this.isRetryableError = options?.isRetryableError;
    this.onRetry = options?.onRetry;
  }

  onAttach(store: Store<T>): void {
    this.store = store;
  }

  async onChange(key: string | number, value: T | undefined): Promise<void> {
    const previousValue = this.store.get(key);

    this.snapshots.set(key, previousValue);

    if (value === undefined) {
      this.store.delete(key);
    } else {
      this.store.set(key, value);
    }

    const isRetryableError = this.isRetryableError ?? (() => true);

    let attempt = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await this.mutationFn(key, value);
        this.snapshots.delete(key);

        return;
      } catch (error) {
        attempt++;

        if (!isRetryableError(error)) {
          console.warn(
            '[OptimisticMutationPolicy] Non-retryable error, rolling back:',
            error,
          );
          this.rollback(key);

          return;
        }

        if (attempt > this.maxRetries) {
          console.warn(
            '[OptimisticMutationPolicy] Max retries reached, rolling back:',
            error,
          );
          this.rollback(key);

          return;
        }

        const backoffDelay = this.retryDelayMs * Math.pow(2, attempt - 1);

        this.onRetry?.({ key, attempt, delayMs: backoffDelay });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  private rollback(key: string | number) {
    const original = this.snapshots.get(key);

    if (original === undefined) {
      this.store.delete(key);
    } else {
      this.store.set(key, original);
    }
  }
}
