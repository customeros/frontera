import { Email } from '@store/Inbox/Emails/Email.dto';
import { action, observable, runInAction } from 'mobx';
import { Emails } from '@store/Inbox/Emails/Emails.store';
import { EmailsService } from '@domain/services/inbox/emails/emails.service';

export class EmailsInThreadUsecase {
  private service = new EmailsService();
  @observable accessor expand: Set<string> = new Set();

  constructor(public threadId: string, public store: Emails) {
    this.init = this.init.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
  }

  @action
  toggleExpand(emailId: string) {
    if (this.expand.has(emailId)) {
      this.expand.delete(emailId);
    } else {
      this.expand.add(emailId);
    }
  }

  async init() {
    const result = await this.service.getEmailsByThreadId(this.threadId);

    result?.getAllEmailsInThread.forEach((email) => {
      const foundEmail = this.store.value.get(email.id);

      if (!foundEmail) {
        this.store.value.set(email.id, new Email(this.store, email));
      } else {
        runInAction(() => {
          Object.assign(foundEmail.value, email);
        });
      }
    });
  }
}
