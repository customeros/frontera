import { observer } from 'mobx-react-lite';
import { useFeatureIsOn } from '@growthbook/growthbook-react';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Preferences } from '@shared/components/RootSidenav/hooks';
import { TableIdType } from '@shared/types/__generated__/graphql.types';
import { SidenavItem } from '@shared/components/RootSidenav/components/SidenavItem';
import { TeamViewsSectionSection } from '@shared/components/RootSidenav/components/sections/TeamViewsSection';

import { HomeSection } from './HomeSection';
import { RootSidenavItem } from '../RootSidenavItem';
import { FavoritesSection } from './FavoritesSection';
import { GeneralViewsSection } from './GeneralViewsSection';

interface NavigationSectionsProps {
  preferences: Preferences;
  handleItemClick: (data: string) => void;
  togglePreference: (data: keyof Preferences) => void;
  checkIsActive: (
    path: string[],
    options?: { preset: string | Array<string> },
  ) => boolean;
}

export const NavigationSections = observer(
  ({
    preferences,
    togglePreference,
    handleItemClick,
    checkIsActive,
  }: NavigationSectionsProps) => {
    const showCustomerMap = useFeatureIsOn('show-customer-map');
    const billingFlag = useFeatureIsOn('billing');

    const store = useStore();
    const tableViewDefsList = store.tableViewDefs.toArray();

    const allOrganizationsView = tableViewDefsList.filter(
      (c) => c.value.tableId === TableIdType.Organizations && c.value.isPreset,
    );
    const allContactsView = store.tableViewDefs.getById(
      store.tableViewDefs.contactsPreset ?? '',
    );
    const allOrganizationsActivePreset = [allOrganizationsView?.[0]?.value?.id];
    const customersView = store.tableViewDefs.getById(
      store.tableViewDefs.customersPreset ?? '',
    );

    return (
      <div className='px-2  gap-4 overflow-y-auto overflow-hidden flex flex-col flex-1'>
        <div className='flex flex-col'>
          <div className='flex flex-col mb-3'>
            <HomeSection
              preferences={preferences}
              checkIsActive={checkIsActive}
              handleItemClick={handleItemClick}
              togglePreference={togglePreference}
            />
          </div>

          {showCustomerMap && (
            <SidenavItem
              label='Customer map'
              dataTest={`side-nav-item-customer-map`}
              isActive={checkIsActive(['customer-map'])}
              onClick={() => handleItemClick('customer-map')}
              icon={(isActive) => (
                <Icon
                  name='bubbles'
                  className={cn(
                    'text-grayModern-500',
                    isActive && 'text-grayModern-700',
                  )}
                />
              )}
            />
          )}
          {/* <SidenavItem
          label='Inbox'
          dataTest={`side-nav-item-inbox`}
          isActive={checkIsActive('inbox')}
          onClick={() => handleItemClick('inbox')}
          icon={(isActive) => (
            <Icon
              name='inbox-01'
              className={cn(
                'size-4 min-w-4 text-grayModern-500',
                isActive && 'text-grayModern-700',
              )}
            />
          )}
        /> */}

          <RootSidenavItem
            label='Leads'
            dataTest={`side-nav-item-all-orgs`}
            onClick={() =>
              handleItemClick(
                `finder?preset=${allOrganizationsView?.[0]?.value?.id}`,
              )
            }
            isActive={checkIsActive(['finder'], {
              preset:
                allOrganizationsActivePreset || allContactsView?.value?.id,
            })}
            icon={(isActive) => (
              <Icon
                name='magnet'
                className={cn(
                  'text-grayModern-500',
                  isActive && 'text-grayModern-700',
                )}
              />
            )}
          />

          <RootSidenavItem
            label='Opportunities'
            isActive={checkIsActive(['prospects'])}
            dataTest={`side-nav-item-opportunities`}
            onClick={() => handleItemClick(`prospects`)}
            icon={(isActive) => (
              <Icon
                name='coins-stacked-02'
                className={cn(
                  'text-grayModern-500',
                  isActive && 'text-grayModern-700',
                )}
              />
            )}
          />

          <RootSidenavItem
            label='Customers'
            dataTest={`side-nav-item-customers`}
            isActive={checkIsActive(['customers'])}
            onClick={() =>
              handleItemClick(`finder?preset=${customersView?.value?.id}`)
            }
            icon={(isActive) => (
              <Icon
                name='check-heart'
                className={cn(
                  'text-grayModern-500',
                  isActive && 'text-grayModern-700',
                )}
              />
            )}
          />
        </div>

        <TeamViewsSectionSection
          preferences={preferences}
          checkIsActive={checkIsActive}
          handleItemClick={handleItemClick}
          togglePreference={togglePreference}
        />
        <FavoritesSection
          preferences={preferences}
          checkIsActive={checkIsActive}
          handleItemClick={handleItemClick}
          togglePreference={togglePreference}
        />
        {billingFlag && (
          <GeneralViewsSection
            preferences={preferences}
            checkIsActive={checkIsActive}
            handleItemClick={handleItemClick}
            togglePreference={togglePreference}
          />
        )}
      </div>
    );
  },
);
