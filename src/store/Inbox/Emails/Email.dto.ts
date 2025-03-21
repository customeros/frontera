import { Entity } from '@store/record';
import { EmailDatum } from '@infra/repositories/mailstack/allEmailsInThread/allEmailsInThread.datum';

import { Emails } from './Emails.store';

export class Email extends Entity<EmailDatum> {
  constructor(store: Emails, data: EmailDatum) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(store as any, data);
  }

  get id() {
    return this.value.id;
  }

  get subject() {
    return this.value.subject;
  }

  get body() {
    return this.value.body;
  }

  get from() {
    return this.value.from;
  }

  get fromName() {
    return this.value.fromName;
  }
}
