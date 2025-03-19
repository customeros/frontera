import { merge } from 'lodash';
import { observable } from 'mobx';
import { Entity } from '@store/record';
import { EmailInboxDatum } from '@infra/repositories/mailstack/EmailInbox/emailInbox.datum';

import { EmailsInbox } from './EmailsInbox.store';

export class EmailInbox extends Entity<EmailInboxDatum> {
  @observable accessor value: EmailInboxDatum = EmailInbox.default();
  constructor(store: EmailsInbox, data: EmailInboxDatum) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(store as any, data);
  }

  get id() {
    return this.value.id;
  }

  get isDone() {
    return this.value.isDone;
  }

  get isViewed() {
    return this.value.isViewed;
  }

  get lastMessageAt() {
    return this.value.lastMessageAt;
  }

  get lastSender() {
    return this.value.lastSender;
  }

  get summary() {
    return this.value.summary;
  }

  get userId() {
    return this.value.userId;
  }

  get subject() {
    return this.value.subject;
  }

  static default(payload?: EmailInboxDatum): EmailInboxDatum {
    return merge(
      {
        id: crypto.randomUUID(),
        isDone: false,
        isViewed: false,
        lastMessageAt: null,
        lastSender: '',
        lastSenderDomain: '',
        mailboxId: '',
        subject: '',
        summary: '',
        userId: '',
      },
      payload,
    );
  }
}
