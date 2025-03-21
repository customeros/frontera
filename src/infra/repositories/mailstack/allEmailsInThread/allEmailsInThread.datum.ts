import { GetAllEmailsInThreadQuery } from './query/getAllEmailsInThread.generated';

export type EmailDatum = NonNullable<
  GetAllEmailsInThreadQuery['getAllEmailsInThread']
>[number];
