/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect, describe } from 'vitest';

import { Policy } from './policy';
import { Store } from '../store/store';

class TestPolicy extends Policy<any> {
  public attached = false;

  onAttach(_store: Store<any>) {
    this.attached = true;
  }
}

describe('Policy', () => {
  it('calls onAttach when applied', () => {
    const policy = new TestPolicy();
    const store = new Store();

    policy.onAttach(store);

    expect(policy.attached).toBe(true);
  });
});
