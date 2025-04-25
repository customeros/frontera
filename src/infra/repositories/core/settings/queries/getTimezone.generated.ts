import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type GetTimezoneQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetTimezoneQuery = {
  __typename?: 'Query';
  calendar_timezones: Array<string>;
};
