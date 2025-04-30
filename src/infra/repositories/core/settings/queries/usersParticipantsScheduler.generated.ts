import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type UsersParticipantsInSchedulerQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type UsersParticipantsInSchedulerQuery = {
  __typename?: 'Query';
  participantsForMeetingBookingEvent: Array<{
    __typename?: 'MeetingBookingEventUserParticipant';
    id: string;
    name: string;
    email: string;
    profilePhotoUrl: string;
    connected: boolean;
  }>;
};
