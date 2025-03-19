import { runInAction } from 'mobx';
import { Store } from '@store/_store';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { EmailInboxDatum } from '@infra/repositories/mailstack/EmailInbox/emailInbox.datum';
import { EmailInboxRepository } from '@infra/repositories/mailstack/EmailInbox/emailInbox.repository';

import { EmailInbox } from './EmailInbox.dto';

export class EmailsInbox extends Store<EmailInboxDatum, EmailInbox> {
  private repository = EmailInboxRepository.getInstance();

  constructor(public root: RootStore, public transport: Transport) {
    super(root, transport, {
      name: 'EmailsInbox',
      getId: (data) => data?.id,
      factory: EmailInbox,
    });
  }

  async bootstrap() {
    if (this.isBootstrapped || this.isLoading) return;

    try {
      this.isLoading = true;

      const getThreadsByUser = [
        {
          id: '1',
          isDone: false,
          isViewed: false,
          lastMessageAt: new Date().toISOString(),
          lastSender: 'sender1@example.com',
          lastSenderDomain: 'example.com',
          mailboxId: 'mailbox1',
          subject: 'Earnings report',
          summary:
            'This is a longer body summary from the AI that really should not be longer than this but it could happen,This is a longer body summary from the AI that really should not be longer than this but it could happen',
          userId: this.root.session.value.profile.id,
        },
        {
          id: '2',
          isDone: true,
          isViewed: true,
          lastMessageAt: new Date().toISOString(),
          lastSender: 'sender2@example.com',
          lastSenderDomain: 'example.com',
          mailboxId: 'mailbox2',
          subject: 'Two weeks of your life back ',
          summary: 'Olly needs AI integration insights due to a stretched team',
          userId: this.root.session.value.profile.id,
        },
        {
          id: '3',
          isDone: false,
          isViewed: true,
          lastMessageAt: new Date().toISOString(),
          lastSender: 'sender3@example.com',
          lastSenderDomain: 'example.com',
          mailboxId: 'mailbox3',
          subject: 'Customer feedback session',
          summary: 'Maria wants to discuss recent feedback trends',
          userId: this.root.session.value.profile.id,
        },
        {
          id: '4',
          isDone: false,
          isViewed: false,
          lastMessageAt: new Date().toISOString(),
          lastSender: 'sender3@example.com',
          lastSenderDomain: 'example.com',
          mailboxId: 'mailbox3',
          subject: 'Customer feedback session',
          summary: '',
          userId: this.root.session.value.profile.id,
        },
      ];

      runInAction(() => {
        getThreadsByUser.forEach((thread) => {
          this.value.set(thread.id, new EmailInbox(this, thread));
        });
      });
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error)?.message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
