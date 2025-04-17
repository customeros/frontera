import { RootStore } from '@store/root';
import { Syncable } from '@store/syncable';
import { Transport } from '@infra/transport';
import { action, override, makeObservable } from 'mobx';

import { MailboxProvider } from '@shared/types/__generated__/graphql.types';

import { MailboxesService } from './__service__/Mailboxes/Mailboxes.service';
import { MailboxesQuery } from './__service__/Mailboxes/getMailboxes.generated';

export type Mailbox = NonNullable<
  MailboxesQuery['mailstack_Mailboxes'][number]
>;

export class MailboxStore extends Syncable<Mailbox> {
  private service: MailboxesService;

  constructor(
    public root: RootStore,
    public transport: Transport,
    data: Mailbox,
  ) {
    super(root, transport, data ?? MailboxStore.getDefaultValue());
    this.service = MailboxesService.getInstance(transport);

    makeObservable<MailboxStore>(this, {
      id: override,
      save: override,
      setId: override,
      getId: override,
      invalidate: action,
      getChannelName: override,
    });
  }

  getId() {
    return this.value.mailbox;
  }

  setId(id: string) {
    this.value.mailbox = id;
  }

  getChannelName(): string {
    return 'Mailboxes';
  }

  static getDefaultValue(): Mailbox {
    return {
      provider: MailboxProvider.GoogleWorkspace,
      mailbox: '',
      usedInFlows: false,
      rampUpRate: 0,
      rampUpMax: 0,
      rampUpCurrent: 0,
      needsManualRefresh: false,
    };
  }
}
