import { Tracer } from '@infra/tracer';
import { CalendarAvailability } from '@domain/entities/calendarAvailability.entity';
import { SettingsRepository } from '@infra/repositories/core/settings/settings.repository';

import { unwrap } from '@utils/unwrap';
import { UserCalendarAvailability } from '@shared/types/__generated__/graphql.types';

export class CalendarService {
  private repository = new SettingsRepository();

  constructor() {}

  public async getCalendarConnectionStatus() {
    const span = Tracer.span('CalendarService.getCalendarConnectionStatus');

    const [res, err] = await unwrap(
      this.repository.getConnectedStatus({ email: '' }),
    );

    if (err) {
      console.error(err);
    }

    span.end();

    return res;
  }

  public async getCalendarAvailability(email: string) {
    const span = Tracer.span('CalendarService.getCalendarAvailability');

    const [res, err] = await unwrap(
      this.repository.getCalendarAvailability({ email }),
    );

    span.end();

    if (err) {
      console.error(err);
    }
    const data = res?.calendar_available_hours as UserCalendarAvailability;

    return new CalendarAvailability(data);
  }
}
