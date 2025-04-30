import { Tracer } from '@infra/tracer';
import { action, computed, observable } from 'mobx';
import { SettingsService } from '@domain/services/settings/settings.service';
import { CalendarConnection } from '@domain/entities/calendarConnection.entity';
import { CalendarAvailability } from '@domain/entities/calendarAvailability.entity';

import { UserCalendarAvailabilityInput } from '@shared/types/__generated__/graphql.types';

export class CalendarUserUsecase {
  private service = new SettingsService();

  @observable
  private accessor _calendarAvailability: CalendarAvailability | null = null;
  @observable
  @observable
  private accessor _timezones: string[] | null = null;
  @observable public accessor _email: string | null = null;
  @observable public accessor modalOpen: boolean = false;

  constructor(private calendar: CalendarConnection) {
    this.setEmail = this.setEmail.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.deleteCalendarAvailability =
      this.deleteCalendarAvailability.bind(this);
  }

  public async init(email: string) {
    this.setEmail(email);

    const span = Tracer.span('CalendarUserUsecase.init');

    await Promise.all([this.getCalendarAvailability(), this.getTimezones()]);
    span.end();
  }

  @action
  public toggleModal() {
    this.modalOpen = !this.modalOpen;
  }

  @action
  public setEmail(email: string) {
    this._email = email;
  }

  public async getTimezones() {
    const span = Tracer.span('CalendarUserUsecase.getTimezones');
    const timezones = await this.service.getTimezones();

    this._timezones = timezones?.calendar_timezones || null;

    span.end();
  }

  @computed
  public get email() {
    return this._email;
  }

  public get calendarAvailability() {
    return this._calendarAvailability;
  }

  public get timezones() {
    return this._timezones;
  }

  public async getCalendarAvailability() {
    if (!this.email) return;
    const span = Tracer.span('CalendarUserUsecase.getCalendarAvailability');
    const availability = await this.service.getCalendarAvailability(this.email);

    this._calendarAvailability = availability;

    span.end();

    return availability;
  }

  @action
  public updateCalendarAvailability({
    input: availability,
  }: {
    input: Partial<UserCalendarAvailabilityInput>;
  }) {
    if (!this._calendarAvailability) return;
    const span = Tracer.span('CalendarUserUsecase.updateCalendarAvailability');

    this._calendarAvailability = new CalendarAvailability({
      ...this._calendarAvailability,
      ...availability,
    } as UserCalendarAvailabilityInput);

    span.end();
  }

  public async deleteCalendarAvailability() {
    if (!this.email) return;
    const span = Tracer.span('CalendarUserUsecase.deleteCalendarAvailability');

    await this.service.deleteCalendarAvailability(this.email);
    this.reset();
    span.end();
  }

  @action
  private reset() {
    this._email = null;
    this._calendarAvailability = null;
    this._timezones = null;
    this.calendar.set({
      connected: false,
      email: '',
    });
  }

  public async execute() {
    if (!this._calendarAvailability) return;
    const span = Tracer.span('CalendarUserUsecase.execute');
    const { createdAt, id, updatedAt, ...restAvailability } =
      this._calendarAvailability;

    const updatedAvailability = await this.service.updateCalendarAvailability({
      input: {
        ...restAvailability,
        email: this.email,
      } as UserCalendarAvailabilityInput,
    });

    this._calendarAvailability = new CalendarAvailability(
      updatedAvailability?.save_calendar_available_hours,
    );

    span.end();
  }
}
