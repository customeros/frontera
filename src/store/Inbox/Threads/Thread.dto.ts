import { merge } from 'lodash';
import { observable } from 'mobx';
import { Entity } from '@store/record';
import { ThreadsDatum } from '@infra/repositories/mailstack/Threads/threads.datum';

import { Threads } from './Threads.store';

export class Thread extends Entity<ThreadsDatum> {
  @observable accessor value: ThreadsDatum = Thread.default();
  constructor(store: Threads, data: ThreadsDatum) {
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

  static default(payload?: ThreadsDatum): ThreadsDatum {
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
