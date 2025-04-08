/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangePolicy } from './change-policy'; // or ChangePolicy
import { it, expect, describe } from 'vitest';

describe('ChangePolicy', () => {
  it('calls onChange when a mutation happens', () => {
    const results: any[] = [];

    const policy = new ChangePolicy((key, value) => {
      results.push({ key, value });
    });

    policy.onChange?.('key1', { id: 1 });

    expect(results).toEqual([{ key: 'key1', value: { id: 1 } }]);
  });
});
