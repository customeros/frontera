import { action, observable } from 'mobx';

export class MailboxListUsecase {
  @observable accessor ccEnabled = false;
  @observable accessor bccEnabled = false;
  @observable accessor from = '';

  constructor() {
    this.toggleCc = this.toggleCc.bind(this);
    this.toggleBcc = this.toggleBcc.bind(this);
  }

  @action
  public toggleCc() {
    console.log('toggleCc');
    this.ccEnabled = !this.ccEnabled;
  }

  @action
  public toggleBcc() {
    this.bccEnabled = !this.bccEnabled;
  }
}
