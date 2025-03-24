import hashit from 'hash-it';

export class ViewRegistry {
  public entries: Map<number, unknown> = new Map();
  private static instance: ViewRegistry;

  constructor() {}

  public static getInstance() {
    if (!ViewRegistry.instance) {
      ViewRegistry.instance = new ViewRegistry();
    }

    return ViewRegistry.instance;
  }

  public static has(hash: number) {
    return ViewRegistry.getInstance().entries.has(hash);
  }

  public static get(hash: number) {
    return ViewRegistry.getInstance().entries.get(hash);
  }

  public static register(hash: number, value: unknown) {
    ViewRegistry.getInstance().entries.set(hash, value);
  }
}

export class View {
  public hash: number;
  public run: (...args: unknown[]) => unknown;

  constructor(src: object, run: (...args: unknown[]) => unknown) {
    this.hash = hashit(src);
    this.run = run;

    if (ViewRegistry.has(this.hash)) return;
    ViewRegistry.register(this.hash, run());
  }

  value() {
    return ViewRegistry.get(this.hash);
  }

  invalidate() {
    ViewRegistry.register(this.hash, this.run());
  }
}
