import { GetWebtrackersQuery } from './queries/getWebtrackers.generated';

export type WebtrackDatum = NonNullable<
  GetWebtrackersQuery['webtrackers'][number]
>;
