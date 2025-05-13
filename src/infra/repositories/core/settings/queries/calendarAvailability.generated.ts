import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type CalendarAvailabilityQueryVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
}>;


export type CalendarAvailabilityQuery = { __typename?: 'Query', calendar_available_hours?: { __typename?: 'UserCalendarAvailability', id: string, email: string, timezone: string, createdAt: any, updatedAt: any, monday: { __typename?: 'DayAvailability', enabled: boolean, startHour: string, endHour: string }, tuesday: { __typename?: 'DayAvailability', enabled: boolean, startHour: string, endHour: string }, wednesday: { __typename?: 'DayAvailability', enabled: boolean, startHour: string, endHour: string }, thursday: { __typename?: 'DayAvailability', enabled: boolean, startHour: string, endHour: string }, friday: { __typename?: 'DayAvailability', enabled: boolean, startHour: string, endHour: string }, saturday: { __typename?: 'DayAvailability', enabled: boolean, startHour: string, endHour: string }, sunday: { __typename?: 'DayAvailability', enabled: boolean, startHour: string, endHour: string } } | null };
