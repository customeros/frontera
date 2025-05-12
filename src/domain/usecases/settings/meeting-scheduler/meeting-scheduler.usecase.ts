import { Tracer } from '@infra/tracer';
import { action, observable } from 'mobx';
import { MeetingConfig } from '@domain/entities/meetingConfig.entity';
import { SettingsService } from '@domain/services/settings/settings.service';
import { UserParticipantsInSchedulerDatum } from '@infra/repositories/core/settings/settings.datum';

import { SelectOption } from '@ui/utils/types';

const durationOptions = [
  { label: '15', value: '15' },
  { label: '20', value: '20' },
  { label: '25', value: '25' },
  { label: '30', value: '30' },
  { label: '45', value: '45' },
  { label: '60', value: '60' },
  { label: '90', value: '90' },
  { label: '120', value: '120' },
];

export class MeetingSchedulerUsecase {
  private service = new SettingsService();

  @observable public accessor firstConfig: boolean = true;
  @observable public accessor isDirty: boolean = false;
  @observable public accessor redirectLink: string = '';
  @observable public accessor infoDialogOpen: boolean = false;
  @observable public accessor confirmDialogOpen: boolean = false;
  @observable public accessor confirmDialogRemoveLastUser: boolean = false;
  @observable public accessor duration: SelectOption[] = durationOptions;
  @observable public accessor participants: UserParticipantsInSchedulerDatum[] =
    [];
  @observable public accessor noUserModalConnected: boolean = false;

  constructor(public meetingConfig: MeetingConfig) {
    this.originalMeetingConfig = { ...meetingConfig };
    this.createMeetingConfig = this.createMeetingConfig.bind(this);
    this.toggleNoUserModalConnected =
      this.toggleNoUserModalConnected.bind(this);
    this.toggleConfirmDialogRemoveLastUser =
      this.toggleConfirmDialogRemoveLastUser.bind(this);
    this.updateMeetingConfig = this.updateMeetingConfig.bind(this);
  }

  private originalMeetingConfig: MeetingConfig;

  public toggleInfoDialog() {
    this.infoDialogOpen = !this.infoDialogOpen;
  }

  public toggleConfirmDialog() {
    this.confirmDialogOpen = !this.confirmDialogOpen;
  }

  public toggleNoUserModalConnected() {
    this.noUserModalConnected = !this.noUserModalConnected;
  }

  public toggleConfirmDialogRemoveLastUser() {
    this.confirmDialogRemoveLastUser = !this.confirmDialogRemoveLastUser;
  }

  public setUrl(url: string) {
    this.redirectLink = url;
  }

  public init() {
    const span = Tracer.span('MeetingSchedulerUsecase.init');

    this.getUserParticipantsInScheduler();

    span.end();
  }

  public resetDirty() {
    this.isDirty = false;
    this.originalMeetingConfig = { ...this.meetingConfig };
  }

  public createMeetingConfig() {
    const span = Tracer.span('MeetingSchedulerUsecase.createMeetingConfig');

    this.meetingConfig.id = crypto.randomUUID();

    span.end();
  }

  public updateToDefaultTitle() {
    if (this.meetingConfig.title === '') {
      this.meetingConfig.title = 'Product overview';
    }
  }

  public discardChanges() {
    Object.assign(this.meetingConfig, this.originalMeetingConfig);
    this.isDirty = false;
  }

  @action
  public updateMeetingConfig(data: Partial<MeetingConfig>) {
    if (!this.isDirty) {
      this.originalMeetingConfig = { ...this.meetingConfig };
    }

    if ('description' in data) {
      if (this.meetingConfig.description !== data.description) {
        this.isDirty = true;
      }
    } else {
      this.isDirty = true;
    }

    Object.assign(this.meetingConfig, data);
  }

  public async invalidateSchedulerConfig() {
    return await this.service.getSchedulerConfig();
  }

  public async execute() {
    const span = Tracer.span('MeetingSchedulerUsecase.execute');

    const {
      createdAt,
      updatedAt,
      bookingFormName,
      bookingFormPhone,
      bookingFormEmail,
      participants,
      ...payload
    } = this.meetingConfig;

    await this.service.updateSchedulerConfig({
      input: {
        ...payload,
      },
    });
    this.resetDirty();

    const res = await this.invalidateSchedulerConfig();

    if (res) {
      Object.assign(this.meetingConfig, res.meetingBookingEvents[0]);
    }

    span.end();
  }

  public async getUserParticipantsInScheduler() {
    const span = Tracer.span(
      'MeetingSchedulerUsecase.getUserParticipantsInScheduler',
    );

    const res = await this.service.getUserParticipantsInScheduler();

    span.end();

    if (res?.participantsForMeetingBookingEvent) {
      this.participants = res.participantsForMeetingBookingEvent;
    }
  }
}
