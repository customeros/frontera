import { EmailsRepository } from '@infra/repositories/mailstack/Emails/emails.repository';
import { SendEmailMutationVariables } from '@infra/repositories/mailstack/Emails/mutations/sedEmail.generated';

import { unwrap } from '@utils/unwrap';

export class EmailsService {
  private emailsRepository = EmailsRepository.getInstance();

  public async getEmailsByThreadId(threadId: string) {
    const [res, err] = await unwrap(
      this.emailsRepository.getAllEmailsInThread({ threadId }),
    );

    if (err) {
      throw err;
    }

    if (res) {
      return res;
    }
  }

  public async sendEmail(payload: SendEmailMutationVariables) {
    const [res, err] = await unwrap(this.emailsRepository.sendEmail(payload));

    if (err) {
      throw err;
    }

    if (res) {
      return res;
    }
  }
}
