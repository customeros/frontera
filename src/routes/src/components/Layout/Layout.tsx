import { Outlet, useLocation } from 'react-router-dom';

import { P, match } from 'ts-pattern';
import { SettingsSidenav } from '@settings/components/SettingsSidenav';

import { PageLayout } from '@shared/components/PageLayout';
import { CommandMenu } from '@shared/components/CommandMenu';
import { RootSidenav } from '@shared/components/RootSidenav/RootSidenav';

import { SplashScreen } from '../SplashScreen/SplashScreen';

const knownPaths = [
  '/organization/',
  '/finder',
  '/renewals',
  '/invoices',
  '/prospects',
  '/customer-map',
  '/settings',
  '/welcome',
  '/agents',
  '/flow-editor',
  '/inbox',
];

export const Layout = () => {
  const location = useLocation();

  const sidenav = match(location.pathname)
    .with(
      P.string.startsWith('/finder'),
      P.string.startsWith('/renewals'),
      P.string.startsWith('/invoices'),
      P.string.startsWith('/prospects'),
      P.string.startsWith('/customer-map'),
      P.string.startsWith('/flow-editor'),
      P.string.startsWith('/welcome'),
      P.string.startsWith('/agents'),
      P.string.startsWith('/organization'),
      P.string.startsWith('/inbox'),
      () => <RootSidenav />,
    )
    .with(P.string.startsWith('/settings'), () => <SettingsSidenav />)
    .otherwise(() => null);

  const isResizable = match(location.pathname)
    .with(
      P.string.startsWith('/finder'),
      P.string.startsWith('/renewals'),
      P.string.startsWith('/invoices'),
      P.string.startsWith('/prospects'),
      P.string.startsWith('/flow-editor'),
      P.string.startsWith('/customer-map'),
      P.string.startsWith('/welcome'),
      P.string.startsWith('/agents'),
      P.string.startsWith('/organization'),
      P.string.startsWith('/inbox'),
      () => true,
    )
    .otherwise(() => false);

  const unstyled = knownPaths.every((v) => !location.pathname.startsWith(v));

  return (
    <SplashScreen>
      <CommandMenu />
      <PageLayout
        unstyled={unstyled}
        isResizable={isResizable}
        className='w-screen h-screen'
      >
        {sidenav}
        <div className='h-full w-full flex-col overflow-hidden flex bg-white  '>
          <Outlet />
        </div>
      </PageLayout>
    </SplashScreen>
  );
};
