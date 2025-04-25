import { makeAutoObservable } from 'mobx';
import { CalendarConnectionStatusDatum } from '@infra/repositories/core/settings/settings.datum';

export class CalendarConnection implements CalendarConnectionStatusDatum {
  connected: boolean = false;
  refreshNeeded: boolean = false;
  email: string | null | undefined;

  constructor(data?: Partial<CalendarConnectionStatusDatum>) {
    if (data) {
      Object.assign(this, data);
    }

    makeAutoObservable(this);
  }
}
