/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class Logger {
  private args: string[];

  constructor(...args: string[]) {
    this.args = args;
  }

  private format(level: string, args: any[]) {
    const label = [...this.args, level.toUpperCase()]
      .map((s) => `[${s}]`)
      .join(' ');

    return [label, ...args];
  }

  append(arg: string) {
    return new Logger(...this.args, arg);
  }

  log(...args: any[]) {
    console.log(...this.format('log', args));
  }

  info(...args: any[]) {
    console.info(...this.format('info', args));
  }

  warn(...args: any[]) {
    console.warn(...this.format('warn', args));
  }

  error(...args: any[]) {
    console.error(...this.format('error', args));
  }

  debug(...args: any[]) {
    console.debug(...this.format('debug', args));
  }
}
