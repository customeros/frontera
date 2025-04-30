import { MeetingConfig } from '@domain/entities/meetingConfig.entity';
import { CalendarConnection } from '@domain/entities/calendarConnection.entity';

export const calendarConnectionStore = new CalendarConnection();

export const meetingConfigStore = new MeetingConfig();
