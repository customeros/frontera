import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type MeetingConfigSaveMutationVariables = Types.Exact<{
  input: Types.SaveMeetingBookingEventInput;
}>;


export type MeetingConfigSaveMutation = { __typename?: 'Mutation', meetingBookingEvent_Save: { __typename?: 'MeetingBookingEvent', id: string } };
