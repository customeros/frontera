import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { injectable } from '@infra/container';
import { SettingsRepository } from '@infra/repositories/core/settings';
import { CalendarAvailability } from '@domain/entities/calendarAvailability.entity';
import { SaveUserCalendarAvailabilityMutationVariables } from '@infra/repositories/core/settings/mutations/updateCalendarAvailability.generated';

import { unwrap } from '@utils/unwrap';
import { UserCalendarAvailability } from '@shared/types/__generated__/graphql.types';

@injectable
export class SettingsService {
  private settingsRepo = new SettingsRepository();
  private store = RootStore.getInstance();

  public async toggleBilling(newStatus: boolean) {
    this.store.settings.tenant.updateBillingStatus(newStatus);

    const [res, err] = await unwrap(
      this.settingsRepo.updateTenantSettings({
        input: {
          billingEnabled: newStatus,
        },
      }),
    );

    if (err) {
      console.error(err);
      this.store.settings.tenant.updateBillingStatus(!newStatus);

      this.store.ui.toastError(
        'Failed to update billing status',
        'billing-status-update',
      );

      return;
    }

    if (!res) {
      console.error('No response from update billing status');

      return;
    }

    this.store.ui.toastSuccess(
      `Billing ${newStatus ? 'enabled' : 'disabled'}`,
      `billing-toggled-${newStatus}`,
    );
  }

  public async getCalendarConnectionStatus() {
    const span = Tracer.span('CalendarService.getCalendarConnectionStatus');

    const [res, err] = await unwrap(
      this.settingsRepo.getConnectedStatus({ email: '' }),
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
      this.settingsRepo.getCalendarAvailability({ email }),
    );

    span.end();

    if (err) {
      console.error(err);
    }
    const data = res?.calendar_available_hours as UserCalendarAvailability;

    return new CalendarAvailability(data);
  }

  public async getTimezones() {
    const span = Tracer.span('CalendarService.getTimezones');

    const [res, err] = await unwrap(this.settingsRepo.getTimezones());

    span.end();

    if (err) {
      console.error(err);
    }

    return res;
  }

  public async updateCalendarAvailability(
    input: SaveUserCalendarAvailabilityMutationVariables,
  ) {
    const span = Tracer.span('CalendarService.updateCalendarAvailability');

    const [res, err] = await unwrap(
      this.settingsRepo.updateCalendarAvailability(input),
    );

    span.end();

    if (err) {
      console.error(err);
    }

    return res;
  }

  public async deleteCalendarAvailability(email: string) {
    const span = Tracer.span('CalendarService.deleteCalendarAvailability');

    const [res, err] = await unwrap(
      this.settingsRepo.deleteCalendarAvailability({ email }),
    );

    span.end();

    if (err) {
      console.error(err);
    }

    return res;
  }
}
