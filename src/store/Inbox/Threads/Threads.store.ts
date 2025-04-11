import { Store } from '@store/_store';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { observable, runInAction } from 'mobx';
import { ThreadsService } from '@domain/services/inbox/threads/threads.service';
import { ThreadsDatum } from '@infra/repositories/mailstack/Threads/threads.datum';

import { Thread } from './Thread.dto';

export class Threads extends Store<ThreadsDatum, Thread> {
  private service = new ThreadsService();
  private currentOffset = 0;
  private limit = 20;
  @observable accessor endCursor: string | null = null;
  @observable accessor hasNextPage: boolean = true;

  constructor(public root: RootStore, public transport: Transport) {
    super(root, transport, {
      name: 'Threads',
      getId: (data) => data?.id,
      factory: Thread,
    });
  }

  async bootstrap() {
    if (this.isBootstrapped || this.isLoading) return;
    this.isBootstrapped = true;

    // try {
    //   this.isLoading = true;
    //   await this.loadMoreThreads();
    //   this.isBootstrapped = true;
    // } catch (error) {
    //   runInAction(() => {
    //     this.error = (error as Error)?.message;
    //   });
    //   throw error;
    // } finally {
    //   runInAction(() => {
    //     this.isLoading = false;
    //   });
    // }
  }

  async loadMoreThreads() {
    try {
      const res = await this.service.getThreads({
        userId: '1',
        pagination: {
          limit: this.limit,
          offset: this.currentOffset,
        },
      });

      runInAction(() => {
        res?.getAllThreads.edges.forEach((thread) => {
          this.value.set(thread.id, new Thread(this, thread));
        });
        this.currentOffset += this.limit;
        this.endCursor = res?.getAllThreads.pageInfo.endCursor ?? null;
        this.hasNextPage = res?.getAllThreads.pageInfo.hasNextPage ?? false;
        this.totalElements = this.value.size;
      });
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error)?.message;
      });
      throw error;
    }
  }
}

// const getThreadsByUserMock = [
//   {
//     id: '1',
//     isDone: false,
//     isViewed: false,
//     lastMessageAt: new Date().toISOString(),
//     lastSender: 'sender1@example.com',
//     lastSenderDomain: 'example.com',
//     mailboxId: 'mailbox1',
//     subject: 'Earnings report',
//     summary:
//       'This is a longer body summary from the AI that really should not be longer than this but it could happen,This is a longer body summary from the AI that really should not be longer than this but it could happen',
//     userId: this.root.session.value.profile.id,
//   },
//   {
//     id: '2',
//     isDone: true,
//     isViewed: true,
//     lastMessageAt: new Date().toISOString(),
//     lastSender: 'sender2@example.com',
//     lastSenderDomain: 'example.com',
//     mailboxId: 'mailbox2',
//     subject: 'Two weeks of your life back ',
//     summary: 'Olly needs AI integration insights due to a stretched team',
//     userId: this.root.session.value.profile.id,
//   },
//   {
//     id: '3',
//     isDone: false,
//     isViewed: true,
//     lastMessageAt: new Date().toISOString(),
//     lastSender: 'sender3@example.com',
//     lastSenderDomain: 'example.com',
//     mailboxId: 'mailbox3',
//     subject: 'Customer feedback session',
//     summary: 'Maria wants to discuss recent feedback trends',
//     userId: this.root.session.value.profile.id,
//   },
//   {
//     id: '4',
//     isDone: false,
//     isViewed: false,
//     lastMessageAt: new Date().toISOString(),
//     lastSender: 'sender3@example.com',
//     lastSenderDomain: 'example.com',
//     mailboxId: 'mailbox3',
//     subject: 'Customer feedback session',
//     summary: '',
//     userId: this.root.session.value.profile.id,
//   },
// ];
