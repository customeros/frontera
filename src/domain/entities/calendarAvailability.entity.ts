import { makeAutoObservable } from 'mobx';
import { DayAvailability } from '@domain/objects/dayAvailability';
import { CalendarAvailabilityDatum } from '@infra/repositories/core/settings/settings.datum';

import { UserCalendarAvailability } from '@shared/types/__generated__/graphql.types';

export class CalendarAvailability implements CalendarAvailabilityDatum {
  id: UserCalendarAvailability['id'] = crypto.randomUUID();
  email: UserCalendarAvailability['email'] = '';
  timezone: UserCalendarAvailability['timezone'] = '';
  createdAt: UserCalendarAvailability['createdAt'] = new Date().toISOString();
  updatedAt: UserCalendarAvailability['updatedAt'] = new Date().toISOString();
  friday: DayAvailability = DayAvailability.create();
  saturday: DayAvailability = DayAvailability.create();
  sunday: DayAvailability = DayAvailability.create();
  monday: DayAvailability = DayAvailability.create();
  thursday: DayAvailability = DayAvailability.create();
  tuesday: DayAvailability = DayAvailability.create();
  wednesday: DayAvailability = DayAvailability.create();

  constructor(data?: Partial<UserCalendarAvailability>) {
    if (data) {
      Object.assign(this, data);
    }

    makeAutoObservable(this);
  }
}
