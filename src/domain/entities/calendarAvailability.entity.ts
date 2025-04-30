import { makeAutoObservable } from 'mobx';
import { DayAvailability } from '@domain/objects/dayAvailability';
import { CalendarAvailabilityDatum } from '@infra/repositories/core/settings/settings.datum';

export class CalendarAvailability implements CalendarAvailabilityDatum {
  id: CalendarAvailabilityDatum['id'] = crypto.randomUUID();
  email: CalendarAvailabilityDatum['email'] = '';
  timezone: CalendarAvailabilityDatum['timezone'] = '';
  createdAt: CalendarAvailabilityDatum['createdAt'] = new Date().toISOString();
  updatedAt: CalendarAvailabilityDatum['updatedAt'] = new Date().toISOString();
  friday: DayAvailability = DayAvailability.create();
  saturday: DayAvailability = DayAvailability.create();
  sunday: DayAvailability = DayAvailability.create();
  monday: DayAvailability = DayAvailability.create();
  thursday: DayAvailability = DayAvailability.create();
  tuesday: DayAvailability = DayAvailability.create();
  wednesday: DayAvailability = DayAvailability.create();

  constructor(data?: Partial<CalendarAvailabilityDatum>) {
    if (data) {
      Object.assign(this, data);
    }

    makeAutoObservable(this);
  }
}
