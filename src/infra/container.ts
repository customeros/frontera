import 'reflect-metadata';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = any> = new (...args: any[]) => T;

class Container {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private services = new Map<string | symbol | Constructor, any>();

  register<T>(
    token: string | symbol | Constructor<T>,
    provider: Constructor<T> | T,
  ) {
    if (typeof provider === 'function') {
      this.services.set(token, { provider, instance: null });
    } else {
      this.services.set(token, { provider: null, instance: provider });
    }
  }

  // Resolve dependencies automatically
  resolve<T>(token: string | symbol | Constructor<T>): T {
    const service = this.services.get(token);

    if (!service) {
      throw new Error(`Service not found for token: ${token.toString()}`);
    }

    if (service.instance) {
      return service.instance;
    }

    if (service.provider) {
      const paramTypes: Constructor[] =
        Reflect.getMetadata('design:paramtypes', service.provider) || [];
      const dependencies = paramTypes.map((param) => this.resolve(param));

      const instance = new service.provider(...dependencies);

      service.instance = instance; // Singleton by default

      return instance;
    }

    return service.instance;
  }
}

export function inject<T>(token: Constructor<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target: any, _context: ClassFieldDecoratorContext) {
    return function () {
      return container.resolve(token);
    };
  };
}

export function injectable<T extends Constructor>(
  target: T,
  _context: ClassDecoratorContext,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isSingleton = typeof (target as any)?.getInstance === 'function';

  if (isSingleton) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = (target as any)?.getInstance();

    container.register(target, instance);
  } else {
    container.register(target, target);
  }
}

export const container = new Container();
