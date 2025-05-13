import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type SchedulerConfigQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type SchedulerConfigQuery = { __typename?: 'Query', meetingBookingEvents: Array<{ __typename?: 'MeetingBookingEvent', id: string, createdAt: any, updatedAt: any, title: string, durationMins: any, description: string, location: string, participantEmails: Array<string>, bookingFormName: string, bookingFormEmail: string, bookingFormPhone: string, bookingFormNameEnabled: boolean, bookingFormEmailEnabled: boolean, bookingFormPhoneEnabled: boolean, bookOptionEnabled: boolean, bookOptionBufferBetweenMeetingsMins: any, bookOptionDaysInAdvance: any, bookingFormPhoneRequired: boolean, bookOptionMinNoticeMins: any, assignmentMethod: Types.MeetingBookingAssignmentMethod, emailNotificationEnabled: boolean, bookingConfirmationRedirectLink: string, showLogo: boolean, participants: Array<{ __typename?: 'MeetingBookingEventUserParticipant', id: string, name: string, email: string, profilePhotoUrl: string, connected: boolean }> }> };
