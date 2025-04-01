import * as Types from '../../../../../routes/src/types/__generated__/graphqlMailstack.types';

export type SendEmailMutationVariables = Types.Exact<{
  input: Types.EmailInput;
}>;

export type SendEmailMutation = {
  __typename?: 'Mutation';
  sendEmail: {
    __typename?: 'EmailResult';
    emailId: string;
    error?: string | null;
    status: Types.EmailStatus;
  };
};
