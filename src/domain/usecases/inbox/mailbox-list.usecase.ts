import { action, observable } from 'mobx';

export class MailboxListUsecase {
  @observable accessor ccEnabled = false;
  @observable accessor bccEnabled = false;
  @observable accessor from = '';

  constructor() {
    this.toggleCc = this.toggleCc.bind(this);
    this.toggleBcc = this.toggleBcc.bind(this);
    this.selectMailbox = this.selectMailbox.bind(this);
  }

  @action
  public toggleCc() {
    this.ccEnabled = !this.ccEnabled;
  }

  @action
  public toggleBcc() {
    this.bccEnabled = !this.bccEnabled;
  }

  @action
  public selectMailbox(mailbox: string) {
    this.from = mailbox;
  }
}
