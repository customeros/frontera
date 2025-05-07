import * as Types from '../../../../../routes/src/types/__generated__/graphqlLeads.types';

export type CreateWebTrackerMutationVariables = Types.Exact<{
  tracker: Types.WebtrackerSaveInput;
}>;

export type CreateWebTrackerMutation = {
  __typename?: 'Mutation';
  createWebtracker: {
    __typename?: 'Webtracker';
    id: string;
    domain: string;
    cnameHost: string;
    cnameTarget: string;
  };
};
