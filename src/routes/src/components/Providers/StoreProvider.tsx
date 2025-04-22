import { useMemo, useEffect, createContext } from 'react';

import { when } from 'mobx';
import { RootStore } from '@store/root';
import { bootstrapper } from '@/domain/bootstrap';

export const StoreContext = createContext<RootStore>({} as RootStore);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const rootStore = useMemo(() => {
    return RootStore.getInstance();
  }, []);

  useEffect(() => {
    when(
      () => rootStore.isAuthenticated && rootStore.tableViewDefs.isBootstrapped,
      async () => await bootstrapper.run(),
    );
  }, []);

  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};
