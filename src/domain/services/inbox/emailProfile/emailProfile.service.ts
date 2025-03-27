import { EmailProfileRepository } from '@infra/repositories/core/emailProfile/email.repository';

export class EmailProfileService {
  private emailProfileRepository = EmailProfileRepository.getInstance();

  public async getProfile(emails: string[]) {
    return this.emailProfileRepository.getProfile({ emails });
  }
}
