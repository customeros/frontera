import { makeAutoObservable } from 'mobx';

import { DataSource, Social as TSocial } from '@graphql/types';

import { Metadata } from './metadata';

export class Social implements TSocial {
  __typename: TSocial['__typename'] = 'Social';
  id: TSocial['id'] = crypto.randomUUID();
  url: TSocial['url'] = '';
  alias: TSocial['alias'] = '';
  source: TSocial['source'] = DataSource.Na;
  appSource: TSocial['appSource'] = '';
  metadata: TSocial['metadata'] = Metadata.create();
  sourceOfTruth: TSocial['sourceOfTruth'] = DataSource.Na;
  createdAt: TSocial['createdAt'] = new Date().toISOString();
  updatedAt: TSocial['updatedAt'] = new Date().toISOString();
  externalId: TSocial['externalId'] = '';
  followersCount: TSocial['followersCount'] = 0;

  constructor(data?: Partial<TSocial>) {
    if (data) Object.assign(this, data);
    makeAutoObservable(this);
  }

  static create(data?: Partial<TSocial>) {
    return new Social(data);
  }
}
