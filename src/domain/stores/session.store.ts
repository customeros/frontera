import { makeAutoObservable } from 'mobx';

class SessionStore {
  isAuthenticated = false;
  tenant = '';

  constructor() {
    makeAutoObservable(this);
  }

  setIsAuthenthicated = () => {
    this.isAuthenticated = true;
  };

  setTenant = (tenant: string) => {
    this.tenant = tenant;
  };
}

export const sessionStore = new SessionStore();
