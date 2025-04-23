import { makeAutoObservable } from 'mobx';

import { DataSource, Metadata as TMetadata } from '@graphql/types';

export class Metadata implements TMetadata {
  __typename: TMetadata['__typename'] = 'Metadata';
  id: TMetadata['id'] = crypto.randomUUID();
  appSource: TMetadata['appSource'] = '';
  source: TMetadata['source'] = DataSource.Na;
  created: TMetadata['created'] = new Date().toISOString();
  lastUpdated: TMetadata['lastUpdated'] = new Date().toISOString();
  version: TMetadata['version'] = '';
  sourceOfTruth: TMetadata['sourceOfTruth'] = DataSource.Na;

  constructor(data?: Partial<TMetadata>) {
    if (data) Object.assign(this, data);

    makeAutoObservable(this);
  }

  static create(data?: Partial<TMetadata>) {
    return new Metadata(data);
  }
}
