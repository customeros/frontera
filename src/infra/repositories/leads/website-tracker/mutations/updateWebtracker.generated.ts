import * as Types from '../../../../../routes/src/types/__generated__/graphqlLeads.types';

export type UpdateWebTrackerMutationVariables = Types.Exact<{
  tracker: Types.WebtrackerSaveInput;
}>;

export type UpdateWebTrackerMutation = {
  __typename?: 'Mutation';
  updateWebtracker: {
    __typename?: 'Webtracker';
    id: string;
    domain: string;
    cnameHost: string;
    cnameTarget: string;
  };
};
