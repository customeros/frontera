import { useState } from 'react';
import { cssTransition, ToastContainer } from 'react-toastify';

import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useDisclosure } from '@ui/utils/hooks/useDisclosure';
import { Devtools } from '@shared/components/Devtools/Devtools';

import { StoreProvider } from './StoreProvider';
import { AnalyticsProvider } from './AnalyticsProvider';
import { PhoenixSocketProvider } from './SocketProvider';
import { GrowthbookProvider } from './GrowthbookProvider';
import { IntegrationsProvider } from './IntegrationsProvider';

interface ProvidersProps {
  isProduction?: boolean;
  children: React.ReactNode;
}

export const Providers = ({ children, isProduction }: ProvidersProps) => {
  const { open, onClose, onToggle } = useDisclosure();
  const isDebuggerEnabled = import.meta.env.DEV;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <PhoenixSocketProvider>
          <RecoilRoot>
            <IntegrationsProvider>
              <GrowthbookProvider>
                <AnalyticsProvider isProduction={isProduction}>
                  {children}
                  {isDebuggerEnabled && (
                    <Devtools
                      open={open}
                      onClose={onClose}
                      onToggle={onToggle}
                    />
                  )}
                  <ToastContainer
                    limit={3}
                    theme='colored'
                    autoClose={8000}
                    closeOnClick={true}
                    hideProgressBar={true}
                    position='bottom-right'
                    transition={cssTransition({
                      enter: 'animate-slideDownAndFade',
                      exit: 'animate-fadeOut',
                      collapse: false,
                    })}
                  />
                </AnalyticsProvider>
              </GrowthbookProvider>
            </IntegrationsProvider>
          </RecoilRoot>
        </PhoenixSocketProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
};
