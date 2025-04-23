import { makeAutoObservable } from 'mobx';

import { Domain as TDomain } from '@graphql/types';

export class Domain implements TDomain {
  __typename: TDomain['__typename'] = 'Domain';
  domain: TDomain['domain'] = '';
  primary: TDomain['primary'] = false;
  primaryDomain: TDomain['primaryDomain'] = '';

  constructor(data?: Partial<TDomain>) {
    if (data) Object.assign(this, data);

    makeAutoObservable(this);
  }

  static create(data?: Partial<TDomain>) {
    return new Domain(data);
  }
}
