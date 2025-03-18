import { RootStore } from '@store/root';
import { injectable } from '@infra/container';
import { SettingsRepository } from '@infra/repositories/core/settings';

import { unwrap } from '@utils/unwrap';

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
}
