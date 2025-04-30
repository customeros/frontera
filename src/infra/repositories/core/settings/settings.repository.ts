import { Transport } from '@infra/transport';

import GetTimezoneDocument from './queries/getTimezone.graphql';
import TenantSettingsDocument from './queries/tenantSettings.graphql';
import { GetTimezoneQuery } from './queries/getTimezone.generated.ts';
import SchedulerConfigDocument from './queries/schedulerConfig.graphql';
import { SchedulerConfigQuery } from './queries/schedulerConfig.generated.ts';
import MeetingConfigSaveDocument from './mutations/meetingConfigSave.graphql';
import { GetTimezoneQueryVariables } from './queries/getTimezone.generated.ts';
import DisconnectCalendarDocument from './mutations/disconnectCalendar.graphql';
import ConnectCalendarMutationDocument from './mutations/connectCalendar.graphql';
import CalendarAvailabilityDocument from './queries/calendarAvailability.graphql';
import UpdateTenantSettingsDocument from './mutations/updateTenantSettings.graphql';
import CalendarConnectionDocument from './queries/calendarConnectionStatus.graphql';
import { SchedulerConfigQueryVariables } from './queries/schedulerConfig.generated.ts';
import { MeetingConfigSaveMutation } from './mutations/meetingConfigSave.generated.ts';
import { CalendarAvailabilityQuery } from './queries/calendarAvailability.generated.ts';
import { DisconnectCalendarMutation } from './mutations/disconnectCalendar.generated.ts';
import { CalendarConnectionQuery } from './queries/calendarConnectionStatus.generated.ts';
import { MeetingConfigSaveMutationVariables } from './mutations/meetingConfigSave.generated.ts';
import UsersParticipantsInSchedulerDocument from './queries/usersParticipantsScheduler.graphql';
import { CalendarAvailabilityQueryVariables } from './queries/calendarAvailability.generated.ts';
import SaveUserCalendarAvailabilityDocument from './mutations/updateCalendarAvailability.graphql';
import { DisconnectCalendarMutationVariables } from './mutations/disconnectCalendar.generated.ts';
import { CalendarConnectionQueryVariables } from './queries/calendarConnectionStatus.generated.ts';
import {
  TenantSettingsQuery,
  TenantSettingsQueryVariables,
} from './queries/tenantSettings.generated.ts';
import {
  ConnectCalendarMutation,
  ConnectCalendarMutationVariables,
} from './mutations/connectCalendar.generated.ts';
import {
  UpdateTenantSettingsMutation,
  UpdateTenantSettingsMutationVariables,
} from './mutations/updateTenantSettings.generated.ts';
import {
  UsersParticipantsInSchedulerQuery,
  UsersParticipantsInSchedulerQueryVariables,
} from './queries/usersParticipantsScheduler.generated.ts';
import {
  SaveUserCalendarAvailabilityMutation,
  SaveUserCalendarAvailabilityMutationVariables,
} from './mutations/updateCalendarAvailability.generated.ts';

export class SettingsRepository {
  private transport = Transport.getInstance();

  constructor() {}

  async getTenantSettings() {
    return this.transport.graphql.request<
      TenantSettingsQuery,
      TenantSettingsQueryVariables
    >(TenantSettingsDocument);
  }

  async updateTenantSettings(payload: UpdateTenantSettingsMutationVariables) {
    return this.transport.graphql.request<
      UpdateTenantSettingsMutation,
      UpdateTenantSettingsMutationVariables
    >(UpdateTenantSettingsDocument, payload);
  }

  public async getConnectedStatus(payload: CalendarConnectionQueryVariables) {
    return this.transport.graphql.request<
      CalendarConnectionQuery,
      CalendarConnectionQueryVariables
    >(CalendarConnectionDocument, payload);
  }

  public async connectCalendar(payload: ConnectCalendarMutationVariables) {
    return this.transport.graphql.request<
      ConnectCalendarMutation,
      ConnectCalendarMutationVariables
    >(ConnectCalendarMutationDocument, payload);
  }

  public async getCalendarAvailability(
    payload: CalendarAvailabilityQueryVariables,
  ) {
    return this.transport.graphql.request<
      CalendarAvailabilityQuery,
      CalendarAvailabilityQueryVariables
    >(CalendarAvailabilityDocument, payload);
  }

  public async updateCalendarAvailability(
    payload: SaveUserCalendarAvailabilityMutationVariables,
  ) {
    return this.transport.graphql.request<
      SaveUserCalendarAvailabilityMutation,
      SaveUserCalendarAvailabilityMutationVariables
    >(SaveUserCalendarAvailabilityDocument, payload);
  }

  public async getTimezones() {
    return this.transport.graphql.request<
      GetTimezoneQuery,
      GetTimezoneQueryVariables
    >(GetTimezoneDocument);
  }

  public async deleteCalendarAvailability(
    payload: DisconnectCalendarMutationVariables,
  ) {
    return this.transport.graphql.request<
      DisconnectCalendarMutation,
      DisconnectCalendarMutationVariables
    >(DisconnectCalendarDocument, payload);
  }

  public async getSchedulerConfig() {
    return this.transport.graphql.request<
      SchedulerConfigQuery,
      SchedulerConfigQueryVariables
    >(SchedulerConfigDocument);
  }

  public async updateSchedulerConfig(
    payload: MeetingConfigSaveMutationVariables,
  ) {
    return this.transport.graphql.request<
      MeetingConfigSaveMutation,
      MeetingConfigSaveMutationVariables
    >(MeetingConfigSaveDocument, payload);
  }

  public async getUserParticipantsInScheduler() {
    return this.transport.graphql.request<
      UsersParticipantsInSchedulerQuery,
      UsersParticipantsInSchedulerQueryVariables
    >(UsersParticipantsInSchedulerDocument);
  }
}
