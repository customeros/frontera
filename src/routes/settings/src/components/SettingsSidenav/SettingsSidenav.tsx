import { useNavigate, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';

import { Image } from '@ui/media/Image/Image';
import { useStore } from '@shared/hooks/useStore';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { ArrowNarrowLeft } from '@ui/media/icons/ArrowNarrowLeft';
import { useKeyboardNavigation } from '@shared/components/RootSidenav/hooks/useKeyboardNavigation';
import { SettingsSection } from '@shared/components/RootSidenav/components/sections/SettingsSection';

import { WorkspaceSection } from './components';
import { PersonalSection } from './components/PersonalSection';
import logoCustomerOs from '../../../../src/assets/customer-os-small.png';

export const SettingsSidenav = observer(() => {
  const navigate = useNavigate();
  const store = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [lastActivePosition, setLastActivePosition] = useLocalStorage(
    `customeros-player-last-position`,
    { ['settings']: 'mailboxes', root: 'finder' },
  );

  const hasCampaign = searchParams?.get('campaign') || false;

  const checkIsActive = (tab: string) => searchParams?.get('tab') === tab;

  const handleItemClick = (tab: string) => () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    params.set('tab', tab);
    setLastActivePosition({ ...lastActivePosition, settings: tab });
    setSearchParams(params.toString());
  };

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
        !hasCampaign &&
        !store.ui.commandMenu.isOpen &&
        !store.ui.isEditingTableCell &&
        !store.ui.isFilteringTable,
    },
    store.globalCache.value?.isPlatformOwner ?? false,
  );

  return (
    <div className='pt-[6px] h-full w-[200px] bg-white flex flex-col relative border-r border-grayModern-200'>
      {hasCampaign ? (
        <div className='flex gap-2 items-center mb-4 pl-[10px] pt-[2px]'>
          <Image
            width={20}
            height={20}
            alt='CustomerOS'
            src={logoCustomerOs}
            className='logo-image rounded'
          />
          <span className='font-semibold  text-start w-[fit-content] overflow-hidden text-ellipsis whitespace-nowrap'>
            CustomerOS
          </span>
        </div>
      ) : (
        <>
          <div className='flex gap-2 items-center mb-4'>
            <IconButton
              size='xs'
              variant='ghost'
              aria-label='Go back'
              dataTest='settings-go-back'
              onClick={() => navigate(`/${lastActivePosition.root}`)}
              icon={<ArrowNarrowLeft className='text-grayModern-700' />}
            />

            <p
              data-test='settings-header'
              className='font-semibold text-grayModern-700 break-keep line-clamp-1'
            >
              Settings
            </p>
          </div>

          <div className='flex flex-col w-full justify-between h-full'>
            <div className='flex flex-col space-y-5'>
              <PersonalSection
                checkIsActive={checkIsActive}
                handleItemClick={handleItemClick}
              />
              <WorkspaceSection
                checkIsActive={checkIsActive}
                handleItemClick={handleItemClick}
              />
            </div>

            {/* <FieldsSection
          checkIsActive={checkIsActive}
          handleItemClick={handleItemClick}
        /> */}
          </div>
          <div className='pb-4'>
            <SettingsSection />
          </div>
        </>
      )}
    </div>
  );
});
