export type BootstrapContext<T> = T;
export type BootstrapStep<T> = (ctx: T) => Promise<void> | void;

export class BootstrapManager<T> {
  context: T;

  private readonly steps: BootstrapStep<T>[] = [];

  constructor(context: BootstrapContext<T>) {
    this.context = context;
  }

  registerStep(step: BootstrapStep<T>) {
    this.steps.push(step);
  }

  async run() {
    for (const step of this.steps) {
      await step(this.context);
    }
  }
}
