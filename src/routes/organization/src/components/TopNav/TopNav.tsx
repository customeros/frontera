import { useParams, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';
import { registry } from '@/domain/stores/registry';
import { useFeatureIsOn } from '@growthbook/growthbook-react';

import { Tabs } from '@ui/form/Tabs/Tabs';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { useKeyboardNavigation } from '@shared/components/RootSidenav/hooks/useKeyboardNavigation';

export const TopNav = observer(() => {
  const store = useStore();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const showOldPanels = useFeatureIsOn('billing');

  const organization = registry.get('organizations').get(params?.id as string);

  const [lastActivePosition, setLastActivePosition] = useLocalStorage(
    `customeros-player-last-position`,
    { [params?.id as string]: 'tab=about' },
  );

  const checkIsActive = (tab: string) => searchParams?.get('tab') === tab;

  const handleItemClick = (tab: string) => () => {
    const urlSearchParams = new URLSearchParams(searchParams?.toString());

    urlSearchParams.set('tab', tab);

    setLastActivePosition({
      ...lastActivePosition,
      [params?.id as string]: urlSearchParams.toString(),
    });
    setSearchParams(urlSearchParams);
  };

  const isPlatformOwner = store?.globalCache?.value?.isPlatformOwner ?? false;

  const presets = {
    customersPreset: store.tableViewDefs.customersPreset,
    organizationsPreset: store.tableViewDefs.organizationsPreset,
    upcomingInvoicesPreset: store.tableViewDefs.upcomingInvoicesPreset,
    contractsPreset: store.tableViewDefs.contractsPreset,
    flowSequencesPreset: store.tableViewDefs.flowsPreset,
  };

  useKeyboardNavigation(
    presets,
    {
      when:
        !store.ui.commandMenu.isOpen &&
        !store.ui.isEditingTableCell &&
        !store.ui.isFilteringTable,
    },
    isPlatformOwner,
  );

  if (!organization) return null;

  return (
    <div className='w-full flex justify-start items-center border-b border-grayModern-200 px-2 py-2'>
      <Tabs variant='subtle'>
        <Button
          size='xs'
          onClick={handleItemClick('about')}
          data-state={checkIsActive('about') ? 'active' : 'inactive'}
        >
          About
        </Button>
        <Button
          size='xs'
          onClick={handleItemClick('people')}
          data-state={checkIsActive('people') ? 'active' : 'inactive'}
        >
          People
        </Button>
        {showOldPanels && (
          <>
            <Button
              size='xs'
              onClick={handleItemClick('account')}
              data-state={checkIsActive('account') ? 'active' : 'inactive'}
            >
              Account
            </Button>
            <Button
              size='xs'
              onClick={handleItemClick('invoices')}
              data-state={checkIsActive('invoices') ? 'active' : 'inactive'}
            >
              Invoices
            </Button>
          </>
        )}
      </Tabs>
    </div>
  );
});
