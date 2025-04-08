import { Policy } from './policy';
import { Store } from '../store/store';

export class ChangePolicy<T> extends Policy<T> {
  constructor(
    private onChangeFn: (key: string | number, value: T | undefined) => void,
  ) {
    super();
  }

  onAttach(_store: Store<T>): void {
    // optional
  }

  onChange(key: string | number, value: T | undefined): void {
    this.onChangeFn(key, value);
  }
}
