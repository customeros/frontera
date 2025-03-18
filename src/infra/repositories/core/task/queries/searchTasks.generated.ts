import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type SearchTasksQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  where?: Types.InputMaybe<Types.Filter>;
  sort?: Types.InputMaybe<Types.SortBy>;
}>;

export type SearchTasksQuery = {
  __typename?: 'Query';
  tasks_Search: {
    __typename?: 'TaskSearchResult';
    tasks: Array<string>;
    totalElements: any;
    totalAvailable: any;
  };
};
