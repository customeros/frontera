import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type ArchiveTaskMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
}>;

export type ArchiveTaskMutation = {
  __typename?: 'Mutation';
  task_Archive: { __typename?: 'ActionResponse'; accepted: boolean };
};
