import type { TableViewDef } from '@store/TableViewDefs/TableViewDef.dto';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Preferences } from '@shared/components/RootSidenav/hooks';
import { RootSidenavItem } from '@shared/components/RootSidenav/components/RootSidenavItem';

import { CollapsibleSection } from '../CollapsibleSection';

interface GeneralViewsSectionProps {
  preferences: Preferences;
  handleItemClick: (data: string) => void;
  togglePreference: (data: keyof Preferences) => void;
  checkIsActive: (
    path: string[],
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

    const contractsView = store.tableViewDefs.getById(
      store.tableViewDefs.contractsPreset ?? '',
    );

    const invoicesViews = [
      store.tableViewDefs.getById(
        store.tableViewDefs.upcomingInvoicesPreset ?? '',
      ),
      store.tableViewDefs.getById(store.tableViewDefs.pastInvoicesPreset ?? ''),
    ].filter((e): e is TableViewDef => e !== undefined);

    const upcomingInvoices = invoicesViews[0];

    return (
      <CollapsibleSection
        title='Records'
        isOpen={preferences.isViewsOpen}
        onToggle={() => togglePreference('isViewsOpen')}
      >
        {preferences.isViewsOpen && (
          <>
            {/* <RootSidenavItem
              label='Contacts'
              dataTest={`side-nav-item-all-contacts`}
              onClick={() =>
                handleItemClick(`finder?preset=${allContactsView?.value?.id}`)
              }
              isActive={checkIsActive(['finder'], {
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
            /> */}

            <RootSidenavItem
              label='Contracts'
              dataTest={`side-nav-item-all-contracts`}
              onClick={() =>
                handleItemClick(`finder?preset=${contractsView?.value?.id}`)
              }
              isActive={checkIsActive(['finder'], {
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
            {upcomingInvoices && (
              <RootSidenavItem
                label='Invoices'
                dataTest={`side-nav-item-${upcomingInvoices.value.name}`}
                onClick={() =>
                  handleItemClick(`finder?preset=${upcomingInvoices.value.id}`)
                }
                isActive={checkIsActive(['finder'], {
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
            {/* <RootSidenavItem
              label='Flows'
              dataTest={`side-nav-item-all-flows`}
              onClick={() =>
                handleItemClick(`finder?preset=${flowsView?.value?.id}`)
              }
              isActive={checkIsActive(['finder'], {
                preset: flowsView?.value?.id ?? '',
              })}
              icon={(isActive) => (
                <Icon
                  name='dataflow-03'
                  className={cn(
                    'text-grayModern-500',
                    isActive && 'text-grayModern-700',
                  )}
                />
              )}
            /> */}
          </>
        )}
      </CollapsibleSection>
    );
  },
);
