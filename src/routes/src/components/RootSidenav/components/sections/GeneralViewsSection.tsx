import type { TableViewDef } from '@store/TableViewDefs/TableViewDef.dto';

import { useLocation } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { TableIdType } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';
import { Preferences } from '@shared/components/RootSidenav/hooks';
import { RootSidenavItem } from '@shared/components/RootSidenav/components/RootSidenavItem';

import { CollapsibleSection } from '../CollapsibleSection';

interface GeneralViewsSectionProps {
  preferences: Preferences;
  handleItemClick: (data: string) => void;
  togglePreference: (data: keyof Preferences) => void;
  checkIsActive: (
    path: string,
    options?: { preset: string | Array<string> },
  ) => boolean;
}

export const GeneralViewsSection = observer(
  ({
    preferences,
    togglePreference,
    handleItemClick,
    checkIsActive,
  }: GeneralViewsSectionProps) => {
    const store = useStore();
    const { pathname } = useLocation();

    const tableViewDefsList = store.tableViewDefs.toArray();
    const allOrganizationsView = tableViewDefsList.filter(
      (c) => c.value.tableId === TableIdType.Organizations && c.value.isPreset,
    );

    const allContactsView = store.tableViewDefs.getById(
      store.tableViewDefs.contactsPreset ?? '',
    );
    const contractsView = store.tableViewDefs.getById(
      store.tableViewDefs.contractsPreset ?? '',
    );
    const opportunitiesView = store.tableViewDefs.getById(
      store.tableViewDefs.opportunitiesTablePreset ?? '',
    );

    const invoicesViews = [
      store.tableViewDefs.getById(
        store.tableViewDefs.upcomingInvoicesPreset ?? '',
      ),
      store.tableViewDefs.getById(store.tableViewDefs.pastInvoicesPreset ?? ''),
    ].filter((e): e is TableViewDef => e !== undefined);

    const upcomingInvoices = invoicesViews[0];
    const allOrganizationsActivePreset = [allOrganizationsView?.[0]?.value?.id];
    // const showInvoices = store.settings.tenant.value?.billingEnabled;
    const isOpportinitiesActive = pathname.includes('prospects');

    return (
      <CollapsibleSection
        title='Records'
        isOpen={preferences.isViewsOpen}
        onToggle={() => togglePreference('isViewsOpen')}
      >
        {preferences.isViewsOpen && (
          <>
            <RootSidenavItem
              label='Companies'
              dataTest={`side-nav-item-all-orgs`}
              id={allOrganizationsView?.[0]?.value?.id}
              isActive={checkIsActive('finder', {
                preset: allOrganizationsActivePreset,
              })}
              onClick={() =>
                handleItemClick(
                  `finder?preset=${allOrganizationsView?.[0]?.value?.id}`,
                )
              }
              icon={(isActive) => (
                <Icon
                  name='building-07'
                  className={cn(
                    'text-grayModern-500',
                    isActive && 'text-grayModern-700',
                  )}
                />
              )}
            />
            <RootSidenavItem
              label='Contacts'
              id={allContactsView?.value?.id}
              dataTest={`side-nav-item-all-contacts`}
              onClick={() =>
                handleItemClick(`finder?preset=${allContactsView?.value?.id}`)
              }
              isActive={checkIsActive('finder', {
                preset: allContactsView?.value?.id ?? '',
              })}
              icon={(isActive) => (
                <Icon
                  name='users-01'
                  className={cn(
                    'size-4 min-w-4 text-grayModern-500',
                    isActive && 'text-grayModern-700',
                  )}
                />
              )}
            />
            <RootSidenavItem
              label='Opportunities'
              isActive={isOpportinitiesActive}
              id={opportunitiesView?.value?.id}
              dataTest={`side-nav-item-opportunities`}
              onClick={() =>
                handleItemClick(
                  `prospects?show=finder&preset=${opportunitiesView?.value?.id}`,
                )
              }
              icon={(isActive) => (
                <Icon
                  name='coins-stacked-01'
                  className={cn(
                    'text-grayModern-500',
                    isActive && 'text-grayModern-700',
                  )}
                />
              )}
            />
            {upcomingInvoices && (
              <RootSidenavItem
                label='Invoices'
                id={upcomingInvoices.value.id}
                key={upcomingInvoices.value.id}
                dataTest={`side-nav-item-${upcomingInvoices.value.name}`}
                onClick={() =>
                  handleItemClick(`finder?preset=${upcomingInvoices.value.id}`)
                }
                isActive={checkIsActive('finder', {
                  preset: invoicesViews.map((e) => e?.value?.id),
                })}
                icon={(isActive) => (
                  <Icon
                    name='invoice'
                    className={cn(
                      'text-grayModern-500',
                      isActive && 'text-grayModern-700',
                    )}
                  />
                )}
              />
            )}
            <RootSidenavItem
              label='Contracts'
              id={contractsView?.value?.id}
              dataTest={`side-nav-item-all-contracts`}
              onClick={() =>
                handleItemClick(`finder?preset=${contractsView?.value?.id}`)
              }
              isActive={checkIsActive('finder', {
                preset: contractsView?.value?.id ?? '',
              })}
              icon={(isActive) => (
                <Icon
                  strokeWidth={0}
                  name='signature'
                  fill='currentColor'
                  className={cn(
                    'text-grayModern-500',
                    isActive && 'text-grayModern-700',
                  )}
                />
              )}
            />
          </>
        )}
      </CollapsibleSection>
    );
  },
);
