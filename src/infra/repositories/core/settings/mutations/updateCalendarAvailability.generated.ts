import * as Types from '../../../../../routes/src/types/__generated__/graphql.types';

export type SaveUserCalendarAvailabilityMutationVariables = Types.Exact<{
  input: Types.UserCalendarAvailabilityInput;
}>;

export type SaveUserCalendarAvailabilityMutation = {
  __typename?: 'Mutation';
  save_calendar_available_hours: {
    __typename?: 'UserCalendarAvailability';
    email: string;
    id: string;
    timezone: string;
    createdAt: any;
    updatedAt: any;
    monday: {
      __typename?: 'DayAvailability';
      enabled: boolean;
      startHour: string;
      endHour: string;
    };
    tuesday: {
      __typename?: 'DayAvailability';
      enabled: boolean;
      startHour: string;
      endHour: string;
    };
    wednesday: {
      __typename?: 'DayAvailability';
      enabled: boolean;
      startHour: string;
      endHour: string;
    };
    thursday: {
      __typename?: 'DayAvailability';
      enabled: boolean;
      startHour: string;
      endHour: string;
    };
    friday: {
      __typename?: 'DayAvailability';
      enabled: boolean;
      startHour: string;
      endHour: string;
    };
    saturday: {
      __typename?: 'DayAvailability';
      enabled: boolean;
      startHour: string;
      endHour: string;
    };
    sunday: {
      __typename?: 'DayAvailability';
      enabled: boolean;
      startHour: string;
      endHour: string;
    };
  };
};
