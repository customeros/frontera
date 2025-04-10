import { GetInboxQueryQuery } from './query/getInbox.generated';

export type ThreadsDatum = NonNullable<
  GetInboxQueryQuery['getAllThreads']['edges'][number]
>;
