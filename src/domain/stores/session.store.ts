import { makeAutoObservable } from 'mobx';

class SessionStore {
  isAuthenticated = false;

  constructor() {
    makeAutoObservable(this);
  }

  setIsAuthenthicated = () => {
    this.isAuthenticated = true;
  };
}

export const sessionStore = new SessionStore();
