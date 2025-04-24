import { action, computed, observable } from 'mobx';
import { CalendarService } from '@domain/services/calendar/calendar.service';
import { CalendarConnection } from '@domain/entities/calendarConnection.entity';
import { CalendarAvailability } from '@domain/entities/calendarAvailability.entity';

export class CalendarUserUsecase {
  private service = new CalendarService();

  @observable
  private accessor _calendarAvailability: CalendarAvailability | null = null;
  @observable
  private accessor _calendarConnectionStatus: CalendarConnection | null = null;
  @observable public accessor _email: string | null = null;

  constructor() {
    this.setEmail = this.setEmail.bind(this);
  }

  public async init(email: string) {
    this.setEmail(email);
    await this.getCalendarConnectionStatus();

    if (this._calendarConnectionStatus?.connected) {
      await this.getCalendarAvailability();
    }
  }

  @action
  public setEmail(email: string) {
    this._email = email;
  }

  @computed
  public get email() {
    return this._email;
  }

  public get calendarAvailability() {
    return this._calendarAvailability;
  }

  public get calendarConnectionStatus() {
    return this._calendarConnectionStatus;
  }

  public async getCalendarConnectionStatus() {
    const status = await this.service.getCalendarConnectionStatus();

    if (status?.nylasIsConnected.connected) {
      this._calendarConnectionStatus = new CalendarConnection(
        status.nylasIsConnected,
      );
      this.setEmail(status.nylasIsConnected.email ?? '');
    }

    return status;
  }

  public async getCalendarAvailability() {
    if (!this.email) return;
    const availability = await this.service.getCalendarAvailability(this.email);

    this._calendarAvailability = availability;

    return availability;
  }
}
