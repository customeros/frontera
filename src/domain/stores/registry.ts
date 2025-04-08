import { StoreRegistry } from '@/lib/store';

import { OrganizationStore } from './organization';

interface StoresMap {
  organizations: typeof OrganizationStore;
}

export type Registry = StoreRegistry<StoresMap>;
export const registry = StoreRegistry.create<StoresMap>();

registry.register('organizations', OrganizationStore);
