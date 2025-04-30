import { TenantSettingsQuery } from './queries/tenantSettings.generated';
import { SchedulerConfigQuery } from './queries/schedulerConfig.generated';
import { CalendarAvailabilityQuery } from './queries/calendarAvailability.generated';
import { CalendarConnectionQuery } from './queries/calendarConnectionStatus.generated';
import { UsersParticipantsInSchedulerQuery } from './queries/usersParticipantsScheduler.generated';
export type SettingsDatum = NonNullable<TenantSettingsQuery['tenantSettings']>;

export type CalendarAvailabilityDatum = NonNullable<
  CalendarAvailabilityQuery['calendar_available_hours']
>;

export type CalendarConnectionStatusDatum = NonNullable<
  CalendarConnectionQuery['nylasIsConnected']
>;

export type SchedulerConfigDatum = NonNullable<
  SchedulerConfigQuery['meetingBookingEvents'][number]
>;

export type UserParticipantsInSchedulerDatum = NonNullable<
  UsersParticipantsInSchedulerQuery['participantsForMeetingBookingEvent']
>[number];
