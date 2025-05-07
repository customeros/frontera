import * as Types from '../../../../../routes/src/types/__generated__/graphqlLeads.types';

export type ArchiveWebtrackerMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;

export type ArchiveWebtrackerMutation = {
  __typename?: 'Mutation';
  archiveWebtracker: boolean;
};
