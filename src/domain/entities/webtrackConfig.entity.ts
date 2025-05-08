import { action, makeAutoObservable } from 'mobx';
import { WebtrackDatum } from '@infra/repositories/leads/website-tracker/website-tracker.datum';

export class WebtrackConfig implements WebtrackDatum {
  __typename?: 'Webtracker';
  id: WebtrackDatum['id'] = '';
  domain: WebtrackDatum['domain'] = '';
  cnameHost: WebtrackDatum['cnameHost'] = '';
  cnameTarget: WebtrackDatum['cnameTarget'] = '';
  isArchived: WebtrackDatum['isArchived'] = false;
  isProxyActive: WebtrackDatum['isProxyActive'] = false;
  isCnameConfigured: WebtrackDatum['isCnameConfigured'] = false;
  createdAt: WebtrackDatum['createdAt'] = new Date().toISOString();
  updatedAt: WebtrackDatum['updatedAt'] = new Date().toISOString();
  lastEventAt: WebtrackDatum['lastEventAt'] = new Date().toISOString();

  constructor(data?: Partial<WebtrackDatum>) {
    Object.assign(this, data);

    makeAutoObservable(this);
  }

  set = (data: Partial<WebtrackDatum>) => {
    Object.assign(this, data);
  };

  @action
  archive = () => {
    this.isArchived = true;
  };
}
