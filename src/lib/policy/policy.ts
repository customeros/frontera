/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from '../store/store';

export interface FetchContext {
  store: Store<any>;
  key: string | number;
}

export abstract class Policy<T> {
  abstract onAttach(store: Store<T>): void | Promise<void>;

  onChange?(key: string | number, value: T | undefined): void | Promise<void>;

  shouldFetch?(ctx: FetchContext): boolean;

  fetch?(ctx: FetchContext): Promise<T>;

  shouldRevalidate?(ctx: FetchContext): boolean;
}
