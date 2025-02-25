import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';

import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { ArrowNarrowLeft } from '@ui/media/icons/ArrowNarrowLeft';
import { SidenavItem } from '@shared/components/RootSidenav/components/SidenavItem';
import { useKeyboardNavigation } from '@shared/components/RootSidenav/hooks/useKeyboardNavigation';

export const OrganizationSidenav = observer(() => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const store = useStore();

  const organization = store.organizations.getById(params?.id as string);

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

  const parentOrgId = organization?.value?.parentId;
  const parentOrgName = organization?.value?.parentName;
  const isPlatformOwner = store?.globalCache?.value?.isPlatformOwner ?? false;

  const presets = {
    targetsPreset: store.tableViewDefs.targetsPreset,
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
    <div className='px-2 pt-[6px] pb-4 h-full w-200 flex flex-col grid-area-sidebar bg-white relative border-r border-grayModern-200'>
      <div className='flex gap-2 items-center mb-4'>
        <IconButton
          size='xs'
          variant='ghost'
          aria-label='Go back'
          dataTest='org-side-nav-back'
          icon={<ArrowNarrowLeft className=' text-grayModern-700 ' />}
          onClick={() => {
            navigate(`/${lastActivePosition?.root || 'finder'}`);
          }}
        />

        <div className='flex flex-col line-clamp-1'>
          {parentOrgId && (
            <span
              onClick={() => navigate(`/organization/${parentOrgId}?tab=about`)}
              className='text-xs text-grayModern-600 truncate no-underline cursor-pointer'
            >
              {parentOrgName}
            </span>
          )}
          <Tooltip label={organization?.value?.name ?? ''}>
            <span className='max-w-150px  font-semibold text-grayModern-700 truncate whitespace-nowrap '>
              {organization?.value?.name || 'Company'}
            </span>
          </Tooltip>
        </div>
      </div>
      <div className='space-y-1 w-full'>
        <SidenavItem
          label='About'
          dataTest='org-side-nav-item-about'
          onClick={handleItemClick('about')}
          icon={<Icon name='info-square' className='size-5' />}
          isActive={checkIsActive('about') || !searchParams?.get('tab')}
        />
        <SidenavItem
          label='People'
          isActive={checkIsActive('people')}
          dataTest='org-side-nav-item-people'
          onClick={handleItemClick('people')}
          icon={<Icon name='users-02' className='size-5' />}
        />
        <SidenavItem
          label='Account'
          isActive={checkIsActive('account')}
          dataTest='org-side-nav-item-account'
          onClick={handleItemClick('account')}
          icon={<Icon className='size-5' name='activity-heart' />}
        />
        <SidenavItem
          label='Invoices'
          isActive={checkIsActive('invoices')}
          dataTest='org-side-nav-item-invoices'
          onClick={handleItemClick('invoices')}
          icon={<Icon name='invoice' className='size-5' />}
        />
      </div>
      <div className='flex flex-col flex-grow justify-end'>
        {/* <NotificationCenter /> */}
      </div>
    </div>
  );
});
