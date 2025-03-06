import * as Types from '../../../../routes/src/types/__generated__/graphql.types';

export type TasksQueryVariables = Types.Exact<{
  ids?: Types.InputMaybe<
    Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input']
  >;
}>;

export type TasksQuery = {
  __typename?: 'Query';
  tasks: Array<{
    __typename?: 'Task';
    id: string;
    subject?: string | null;
    description?: string | null;
    assignees: Array<string>;
    authorId?: string | null;
    status: Types.TaskStatus;
    opportunityIds: Array<string>;
    dueAt?: any | null;
    createdAt: any;
    updatedAt: any;
  }>;
};
