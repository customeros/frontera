import { uniqBy } from 'lodash';
import { Tracer } from '@infra/tracer';
import { action, observable } from 'mobx';
import { Emails } from '@store/Inbox/Emails/Emails.store';
export class MailboxListUsecase {
  @observable accessor from = '';
  @observable accessor ccValue = '';
  @observable accessor bccValue = '';
  @observable accessor toValue = '';
  @observable accessor ccEnabled = false;
  @observable accessor bccEnabled = false;
  @observable accessor toOptions: { label: string; value: string }[] = [];
  @observable accessor bccOptions: { label: string; value: string }[] = [];
  @observable accessor ccOptions: { label: string; value: string }[] = [];
  @observable accessor selectedCC: { label: string; value: string }[] = [];
  @observable accessor selectedBcc: { label: string; value: string }[] = [];
  @observable accessor selectedTo: { label: string; value: string }[] = [];

  constructor(public threadId: string, public emails: Emails) {
    this.toggleCc = this.toggleCc.bind(this);
    this.toggleBcc = this.toggleBcc.bind(this);
    this.setCcValue = this.setCcValue.bind(this);
    this.setBccValue = this.setBccValue.bind(this);
    this.selectMailbox = this.selectMailbox.bind(this);
    this.setToValue = this.setToValue.bind(this);
  }

  @action
  init() {
    const span = Tracer.span('MailboxListUsecase.init', {
      threadId: this.threadId,
      from: this.from,
    });

    if (!this.threadId) return;

    const length = this.emails.getEmailsByThreadId(this.threadId).length;

    this.from =
      this.emails.getEmailsByThreadId(this.threadId)[length - 1]?.value.from ??
      '';

    if (!length) return;
    this.ccOptions = uniqBy(
      this.emails
        .getEmailsByThreadId(this.threadId)
        [length - 1].value.cc?.map((email) => {
          return {
            label: email,
            value: email,
          };
        }) as { label: string; value: string }[],
      'value',
    );

    this.bccOptions = uniqBy(
      this.emails
        .getEmailsByThreadId(this.threadId)
        [length - 1].value.bcc?.map((email) => {
          return {
            label: email,
            value: email,
          };
        }) as { label: string; value: string }[],
      'value',
    );

    this.toOptions = uniqBy(
      this.emails
        .getEmailsByThreadId(this.threadId)
        [length - 1].value.to?.map((email) => {
          return { label: email, value: email };
        }),
      'value',
    );

    this.selectedTo = this.toOptions;
    this.selectedCC = this.ccOptions;
    this.selectedBcc = this.bccOptions;
    span.end();
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

  @action
  public addCc(cc: string) {
    if (cc.length !== 0) {
      this.ccOptions.push({
        label: cc,
        value: cc,
      });
      this.selectedCC.push({
        label: cc,
        value: cc,
      });
    }
  }

  @action
  public addTo(to: string) {
    if (to.length !== 0) {
      this.toOptions.push({
        label: to,
        value: to,
      });
      this.selectedTo.push({
        label: to,
        value: to,
      });
    }
  }

  @action
  public setToValue(value: string) {
    this.toValue = value;
  }

  @action
  public addBcc(bcc: string) {
    if (bcc.length !== 0) {
      this.bccOptions.push({
        label: bcc,
        value: bcc,
      });
      this.selectedBcc.push({
        label: bcc,
        value: bcc,
      });
    }
  }

  @action
  public setCcValue(value: string) {
    this.ccValue = value;
  }

  @action
  public setBccValue(value: string) {
    this.bccValue = value;
  }

  @action
  public selectCC(value: { label: string; value: string }[]) {
    this.selectedCC = value;
  }

  @action
  public selectBcc(value: { label: string; value: string }[]) {
    this.selectedBcc = value;
  }

  @action
  public selectTo(value: { label: string; value: string }[]) {
    this.selectedTo = value;
  }
}
