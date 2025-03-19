import { GetInboxQueryQuery } from './query/getInbox.generated';

export type EmailInboxDatum = NonNullable<
  GetInboxQueryQuery['getThreadsByUser'][number]
>;
