import { uniqBy } from 'lodash';
import { Tracer } from '@infra/tracer';
import { action, observable } from 'mobx';
import { Email } from '@store/Inbox/Emails/Email.dto';
import { Emails } from '@store/Inbox/Emails/Emails.store';
import { EmailsService } from '@domain/services/inbox/emails/emails.service';
import { SendEmailMutationVariables } from '@infra/repositories/mailstack/Emails/mutations/sedEmail.generated';

import { EmailDirection } from '@shared/types/__generated__/graphqlMailstack.types';

export class EmailRecipientsSectionUsecase {
  private service = new EmailsService();
  @observable accessor from = '';
  @observable accessor ccValue: string[] = [];
  @observable accessor bccValue: string[] = [];
  @observable accessor toValue: string[] = [];
  @observable accessor ccEnabled = false;
  @observable accessor bccEnabled = false;
  @observable accessor toOptions: { label: string; value: string }[] = [];
  @observable accessor bccOptions: { label: string; value: string }[] = [];
  @observable accessor ccOptions: { label: string; value: string }[] = [];
  @observable accessor selectedCC: { label: string; value: string }[] = [];
  @observable accessor selectedBcc: { label: string; value: string }[] = [];
  @observable accessor selectedTo: { label: string; value: string }[] = [];
  @observable accessor subject = '';

  constructor(public threadId: string | null, public emails: Emails) {
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

    this.reset();

    if (this.threadId) {
      this.initExistingEmail();
    } else {
      this.initNewEmail();
    }

    span.end();
  }

  @action
  private reset() {
    // Reset all observable state
    this.from = '';
    this.ccValue = [];
    this.bccValue = [];
    this.toValue = [];
    this.ccEnabled = false;
    this.bccEnabled = false;
    this.toOptions = [];
    this.bccOptions = [];
    this.ccOptions = [];
    this.selectedCC = [];
    this.selectedBcc = [];
    this.selectedTo = [];
    this.subject = '';
  }

  @action
  private initExistingEmail() {
    const span = Tracer.span(
      'EmailRecipientsSectionUsecase.initExistingEmail',
      {
        threadId: this.threadId,
      },
    );
    const emails = this.emails.getEmailsByThreadId(this.threadId!);
    const emailLength = emails.length;
    const lastEmail = emails[emailLength - 1]?.value;

    this.from = lastEmail?.from ?? '';

    if (!emailLength) return;
    // Initialize options
    this.ccOptions = uniqBy(
      lastEmail?.cc?.map((email) => ({
        label: email,
        value: email,
      })) ?? [],
      'value',
    );

    this.bccOptions = uniqBy(
      lastEmail?.bcc?.map((email) => ({
        label: email,
        value: email,
      })) ?? [],
      'value',
    );

    this.toOptions = uniqBy(
      lastEmail?.to?.map((email) => ({
        label: email,
        value: email,
      })) ?? [],
      'value',
    );

    // Initialize selected values
    const traceSelectedTo = Tracer.span(
      'EmailRecipientsSectionUsecase.initExistingEmail.selectedTo',
    );

    this.selectedTo = this.toOptions;
    traceSelectedTo.end();

    const traceSelectedCC = Tracer.span(
      'EmailRecipientsSectionUsecase.initExistingEmail.selectedCC',
    );

    this.selectedCC = this.ccOptions;
    traceSelectedCC.end();

    const traceSelectedBcc = Tracer.span(
      'EmailRecipientsSectionUsecase.initExistingEmail.selectedBcc',
    );

    this.selectedBcc = this.bccOptions;
    traceSelectedBcc.end();

    // Initialize value arrays with the latest email data as defaults
    this.toValue = lastEmail?.to ?? [];
    this.ccValue = lastEmail?.cc ?? [];
    this.bccValue = lastEmail?.bcc ?? [];

    span.end();
  }

  @action
  private initNewEmail() {
    const span = Tracer.span('EmailRecipientsSectionUsecase.initNewEmail', {});

    // For new emails, we start with empty arrays
    this.toOptions = [];
    this.ccOptions = [];
    this.bccOptions = [];
    this.selectedTo = [];
    this.selectedCC = [];
    this.selectedBcc = [];

    span.end();
  }

  @action
  public async sendEmail(payload: SendEmailMutationVariables) {
    const result = await this.service.sendEmail(payload);

    if (!result?.sendEmail.emailId) {
      throw new Error('Failed to send email');
    }

    this.emails.value.set(
      result?.sendEmail.emailId,
      new Email(this.emails, {
        attachmentCount: payload.input.attachmentIds?.length ?? 0,
        bcc: this.selectedBcc.map((item) => item.value),
        body: '', // This should be set by the parent component
        cc: this.selectedCC.map((item) => item.value),
        direction: EmailDirection.Outbound,
        from: this.from,
        fromName: '', // This should be set by the parent component
        id: result?.sendEmail.emailId,
        mailboxId: payload.input.mailboxId ?? '',
        receivedAt: new Date(),
        subject: '', // This should be set by the parent component
        threadId: result?.sendEmail.emailId,
        to: this.selectedTo.map((item) => item.value),
      }),
    );

    return result;
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
  public setSubject(subject: string) {
    this.subject = subject;
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
      this.ccValue.push(cc);
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
      this.toValue.push(to);
    }
  }

  @action
  public setToValue(value: string[]) {
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
      this.bccValue.push(bcc);
    }
  }

  @action
  public setCcValue(value: string[]) {
    this.ccValue = value;
  }

  @action
  public setBccValue(value: string[]) {
    this.bccValue = value;
  }

  @action
  public selectCC(value: { label: string; value: string }[]) {
    this.selectedCC = value;
    this.ccValue = value.map((item) => item.value);
  }

  @action
  public selectBcc(value: { label: string; value: string }[]) {
    this.selectedBcc = value;
    this.bccValue = value.map((item) => item.value);
  }

  @action
  public selectTo(value: { label: string; value: string }[]) {
    this.selectedTo = value;
    this.toValue = value.map((item) => item.value);
  }
}
