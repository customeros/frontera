import { Transport } from '@infra/transport';

import ConnectCalendarMutationDocument from './mutations/connectCalendar.graphql';
import CalendarConnectionDocument from './queries/calendarConnectionStatus.graphql';
import {
  ConnectCalendarMutation,
  ConnectCalendarMutationVariables,
} from './mutations/connectCalendar.generated';
import {
  CalendarConnectionQuery,
  CalendarConnectionQueryVariables,
} from './queries/calendarConnectionStatus.generated';
export class CalendarRepository {
  private transport = Transport.getInstance();

  constructor() {}

  public async getConnectedStatus() {
    return this.transport.graphql.request<
      CalendarConnectionQuery,
      CalendarConnectionQueryVariables
    >(CalendarConnectionDocument);
  }

  public async connectCalendar(payload: ConnectCalendarMutationVariables) {
    return this.transport.graphql.request<
      ConnectCalendarMutation,
      ConnectCalendarMutationVariables
    >(ConnectCalendarMutationDocument, payload);
  }
}
