import { useParams, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';
import { registry } from '@/domain/stores/registry';

import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { useKeyboardNavigation } from '@shared/components/RootSidenav/hooks/useKeyboardNavigation';

export const TopNav = observer(() => {
  const store = useStore();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

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
    <div className='w-full flex gap-2 justify-start items-center border-b border-grayModern-200 px-2 py-2'>
      <Button
        size='xs'
        onClick={handleItemClick('about')}
        className='transition-colors duration-7000 border'
        variant={checkIsActive('about') ? 'outline' : 'ghost'}
      >
        About
      </Button>
      <Button
        size='xs'
        onClick={handleItemClick('people')}
        className='transition-colors duration-7000 border'
        variant={checkIsActive('people') ? 'outline' : 'ghost'}
      >
        People
      </Button>
      <Button
        size='xs'
        onClick={handleItemClick('account')}
        className='transition-colors duration-7000 border'
        variant={checkIsActive('account') ? 'outline' : 'ghost'}
      >
        Account
      </Button>
      <Button
        size='xs'
        onClick={handleItemClick('invoices')}
        className='transition-colors duration-7000 border'
        variant={checkIsActive('invoices') ? 'outline' : 'ghost'}
      >
        Invoices
      </Button>
    </div>
  );
});
