import * as Types from '../../../../routes/src/types/__generated__/graphql.types';

export type SaveTaskMutationVariables = Types.Exact<{
  input: Types.TaskInput;
}>;

export type SaveTaskMutation = {
  __typename?: 'Mutation';
  task_Save: {
    __typename?: 'Task';
    id: string;
    subject?: string | null;
    description?: string | null;
    status: Types.TaskStatus;
    assignees: Array<string>;
    authorId?: string | null;
    dueAt?: any | null;
    createdAt: any;
    updatedAt: any;
  };
};
