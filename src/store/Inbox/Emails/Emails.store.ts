import { Store } from '@store/_store';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { EmailDatum } from '@infra/repositories/mailstack/allEmailsInThread/allEmailsInThread.datum';

import { Email } from './Email.dto';

export class Emails extends Store<EmailDatum, Email> {
  constructor(public root: RootStore, public transport: Transport) {
    super(root, transport, {
      name: 'Emails',
      getId: (data) => data?.id,
      factory: Email,
    });
  }

  getEmailsByThreadId(threadId: string) {
    return this.toArray().filter((email) => email.value.threadId === threadId);
  }
}
