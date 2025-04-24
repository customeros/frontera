import { makeAutoObservable } from 'mobx';

import { DayAvailability as TDayAvailability } from '@shared/types/__generated__/graphql.types';

export class DayAvailability implements TDayAvailability {
  enabled: TDayAvailability['enabled'] = false;
  endHour: TDayAvailability['endHour'] = '';
  startHour: TDayAvailability['startHour'] = '';
  __typename?: 'DayAvailability' | undefined;

  constructor(data?: Partial<TDayAvailability>) {
    if (data) Object.assign(this, data);

    makeAutoObservable(this);
  }

  static create(data?: Partial<TDayAvailability>) {
    return new DayAvailability(data);
  }
}
