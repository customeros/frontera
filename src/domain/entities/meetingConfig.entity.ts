import { makeAutoObservable } from 'mobx';
import { SchedulerConfigDatum } from '@infra/repositories/core/settings/settings.datum';

import { MeetingBookingAssignmentMethod } from '@shared/types/__generated__/graphql.types';

export class MeetingConfig implements SchedulerConfigDatum {
  id: SchedulerConfigDatum['id'] = '';
  createdAt: SchedulerConfigDatum['createdAt'] = new Date().toISOString();
  updatedAt: SchedulerConfigDatum['updatedAt'] = new Date().toISOString();
  title: SchedulerConfigDatum['title'] = 'Product overview';
  __typename?: 'MeetingBookingEvent' = undefined;
  durationMins: SchedulerConfigDatum['durationMins'] = '30';
  description: SchedulerConfigDatum['description'] = '';
  location: SchedulerConfigDatum['location'] = 'Google Meet';
  participants: SchedulerConfigDatum['participants'] = [];
  participantEmails: SchedulerConfigDatum['participantEmails'] = [];
  bookingFormName: SchedulerConfigDatum['bookingFormName'] = '';
  bookingFormEmail: SchedulerConfigDatum['bookingFormEmail'] = '';
  bookingFormPhone: SchedulerConfigDatum['bookingFormPhone'] = '';
  bookingFormNameEnabled: SchedulerConfigDatum['bookingFormNameEnabled'] = true;
  bookingFormEmailEnabled: SchedulerConfigDatum['bookingFormEmailEnabled'] =
    true;
  bookingFormPhoneEnabled: SchedulerConfigDatum['bookingFormPhoneEnabled'] =
    true;
  bookingFormPhoneRequired: SchedulerConfigDatum['bookingFormPhoneRequired'] =
    true;
  bookOptionEnabled: SchedulerConfigDatum['bookOptionEnabled'] = false;
  bookOptionBufferBetweenMeetingsMins: SchedulerConfigDatum['bookOptionBufferBetweenMeetingsMins'] =
    '15';
  bookOptionDaysInAdvance: SchedulerConfigDatum['bookOptionDaysInAdvance'] =
    '0';
  bookOptionMinNoticeMins: SchedulerConfigDatum['bookOptionMinNoticeMins'] =
    '0';
  assignmentMethod: MeetingBookingAssignmentMethod =
    MeetingBookingAssignmentMethod.RoundRobinMaxAvailability;
  bookingConfirmationRedirectLink: SchedulerConfigDatum['bookingConfirmationRedirectLink'] =
    '';
  showLogo: SchedulerConfigDatum['showLogo'] = false;
  emailNotificationEnabled: SchedulerConfigDatum['emailNotificationEnabled'] =
    true;

  constructor(data?: Partial<SchedulerConfigDatum>) {
    Object.assign(this, data);

    makeAutoObservable(this);
  }

  set = (
    data: Partial<SchedulerConfigDatum> | Partial<SchedulerConfigDatum>[],
  ) => {
    if (Array.isArray(data)) {
      Object.assign(this, data[0]);
    } else {
      Object.assign(this, data);
    }
  };
}
