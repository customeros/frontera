import { observable, runInAction } from 'mobx';
import { Threads } from '@store/Inbox/Threads/Threads.store';
import { EmailProfileService } from '@domain/services/inbox/emailProfile/emailProfile.service';

import { EmailProfile } from '@shared/types/__generated__/graphql.types';
export class EmailProfileUsecase {
  private service = new EmailProfileService();
  @observable accessor profiles: Map<string, EmailProfile> = new Map();

  constructor(private threadsStore: Threads) {}

  async init() {
    const result = await this.service.getProfile(
      this.threadsStore.toArray().map((thread) => thread.value.lastSender),
    );

    runInAction(() => {
      result.email_ProfilePhoto.forEach((profile) => {
        if (profile.email) {
          this.profiles.set(profile.email, profile);
        }
      });
    });
  }

  getProfile(email: string) {
    return this.profiles.get(email);
  }
}
