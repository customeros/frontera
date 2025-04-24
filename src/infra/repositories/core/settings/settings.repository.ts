import { Transport } from '@infra/transport';

import TenantSettingsDocument from './queries/tenantSettings.graphql';
import ConnectCalendarMutationDocument from './mutations/connectCalendar.graphql';
import CalendarAvailabilityDocument from './queries/calendarAvailability.graphql';
import UpdateTenantSettingsDocument from './mutations/updateTenantSettings.graphql';
import CalendarConnectionDocument from './queries/calendarConnectionStatus.graphql';
import { CalendarAvailabilityQuery } from './queries/calendarAvailability.generated.ts';
import { CalendarConnectionQuery } from './queries/calendarConnectionStatus.generated.ts';
import { CalendarAvailabilityQueryVariables } from './queries/calendarAvailability.generated.ts';
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
}
