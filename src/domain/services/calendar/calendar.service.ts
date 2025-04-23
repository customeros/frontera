import { Tracer } from '@infra/tracer';
import { CalendarRepository } from '@infra/repositories/core/calendarConnection/calendar.repository';

import { unwrap } from '@utils/unwrap';

export class CalendarService {
  private repository = new CalendarRepository();

  constructor() {}

  public async getCalendarConnectionStatus() {
    const span = Tracer.span('CalendarService.getCalendarConnectionStatus');

    const [res, err] = await unwrap(this.repository.getConnectedStatus());

    if (err) {
      console.error(err);
    }

    span.end();

    return res;
  }
}
