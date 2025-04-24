import { TenantSettingsQuery } from './queries/tenantSettings.generated';
import { CalendarAvailabilityQuery } from './queries/calendarAvailability.generated';
import { CalendarConnectionQuery } from './queries/calendarConnectionStatus.generated';

export type SettingsDatum = NonNullable<TenantSettingsQuery['tenantSettings']>;
export type CalendarAvailabilityDatum = NonNullable<
  CalendarAvailabilityQuery['calendar_available_hours']
>;

export type CalendarConnectionStatusDatum = NonNullable<
  CalendarConnectionQuery['nylasIsConnected']
>;
