type MobXAPI = {
  ObservableMap: MapConstructor;
  runInAction: (fn: () => void) => void;
  isObservable: (value: unknown) => boolean;
};

let mobxApi: MobXAPI | null = null;

export function tryLoadMobX(): MobXAPI | null {
  if (mobxApi) return mobxApi;

  try {
    const mobx = require('mobx');

    if (mobx.runInAction && mobx.isObservable) {
      mobxApi = {
        runInAction: mobx.runInAction,
        isObservable: mobx.isObservable,
        ObservableMap: mobx.ObservableMap,
      };

      return mobxApi;
    }
  } catch {
    // mobx is not available
  }

  return null;
}

export type CacheConstructor<T> = new () => Map<string | number, T>;
export type CacheFactory<T> = () => Map<string | number, T>;
export type CacheOption<T> = CacheConstructor<T> | CacheFactory<T>;

export function normalizeCacheFactory<T>(
  input: CacheOption<T>,
): CacheFactory<T> {
  if (isConstructor(input)) {
    return () => new input();
  }

  return input;
}

function isConstructor<T>(fn: unknown): fn is CacheConstructor<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof fn === 'function' && !!(fn as any).prototype?.constructor;
}
