import { StoreRegistry } from '@/lib/store';

import { SettingsStore } from './settings.store';
import { OrganizationStore } from './organization.store';

interface StoresMap {
  settings: typeof SettingsStore;
  organizations: typeof OrganizationStore;
}

export type Registry = StoreRegistry<StoresMap>;
export const registry = StoreRegistry.create<StoresMap>();

registry.register('organizations', OrganizationStore);
registry.register('settings', SettingsStore);
