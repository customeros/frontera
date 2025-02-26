import { useSearchParams } from 'react-router-dom';
import { useEffect, MouseEventHandler } from 'react';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { FinderTable } from '@finder/components/FinderTable';
import { FinderFilters } from '@finder/components/FinderFilters/FinderFilters';

import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { Divider } from '@ui/presentation/Divider';
import { PreviewCard } from '@shared/components/PreviewCard';
import { ViewSettings } from '@shared/components/ViewSettings';
import { ContactDetails } from '@shared/components/ContactDetails';
import { OrganizationDetails } from '@shared/components/OrganizationDetails';
import { ShortcutsPanel } from '@shared/components/PreviewCard/components/ShortcutsPanel';
import {
  TableIdType,
  TableViewType,
} from '@shared/types/__generated__/graphql.types';
import { InvoicePreviewModal } from '@organization/components/Timeline/PastZone/events/invoice/InvoicePreviewModal';

import { Search } from './src/components/Search';

export const FinderPage = observer(() => {
  const store = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const preset = searchParams.get('preset');

  const defaultPreset = store.tableViewDefs.defaultPreset;
  const currentPreset = store.tableViewDefs
    ?.toArray()
    .find((e) => e.value.id === preset)?.value?.name;

  useEffect(() => {
    if (!preset && defaultPreset) {
      setSearchParams(`?preset=${defaultPreset}`);
    }
  }, [preset, setSearchParams, defaultPreset]);

  useEffect(() => {
    match(currentPreset)
      .with('All orgs', () => {
        store.ui.commandMenu.setType('OrganizationHub');
      })

      .otherwise(() => {
        store.ui.commandMenu.setType('GlobalHub');
      });
  }, [preset]);

  const tableViewDef = store.tableViewDefs.getById(preset || '');
  const tableId = tableViewDef?.value.tableId;
  const tableViewType = tableViewDef?.value.tableType;

  const tableType = tableViewDef?.value?.tableType;
  const isPreset = tableViewDef?.value?.isPreset;
  const filters = tableViewDef?.getFilters()?.AND?.length > 0;

  const handleAddToMyViews: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (!preset) {
      store.ui.toastError(
        `We were unable to add this view to favorites`,
        'dup-view-error',
      );

      return;
    }
    store.ui.commandMenu.toggle('DuplicateView');
    store.ui.commandMenu.setContext({
      ids: [preset],
      entity: 'TableViewDef',
    });
  };

  return (
    <div className='flex w-full items-start h-full '>
      <div className='w-[100%] bg-white h-full'>
        <div className='w-full'>
          <Search />
        </div>
        <div className='flex'>
          <div className=' w-full overflow-auto'>
            <div className='flex justify-between mx-4 my-2 items-start'>
              <FinderFilters
                tableId={tableId || TableIdType.Organizations}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type={tableType || (TableViewType.Organizations as any)}
              />
              <div className='flex items-center gap-2'>
                {tableViewDef?.hasFilters() && (
                  <Button
                    size='xs'
                    variant='ghost'
                    onClick={() => tableViewDef?.removeFilters()}
                  >
                    Clear
                  </Button>
                )}
                {isPreset && filters && (
                  <Button size='xs' onClick={handleAddToMyViews}>
                    Save to...
                  </Button>
                )}
                {filters && <Divider className='rotate-90 w-5 mx-[-6px]' />}
                {tableViewType && (
                  <ViewSettings tableId={tableId} type={tableViewType} />
                )}
              </div>
            </div>
            <FinderTable />
          </div>

          {store.ui.showPreviewCard && !store.ui.isSearching && (
            <PreviewCard
              isInvoice={
                tableViewDef?.value.tableType === TableViewType.Invoices
              }
            >
              {tableViewDef?.value.tableType === TableViewType.Contacts && (
                <ContactDetails
                  isExpandble={false}
                  id={String(store.ui.focusRow)}
                />
              )}
              {tableViewDef?.value.tableType === TableViewType.Organizations &&
                store.ui.focusRow && (
                  <div className='px-4'>
                    <OrganizationDetails id={store.ui.focusRow} />
                  </div>
                )}

              {tableViewDef?.value.tableType === TableViewType.Invoices &&
                store.ui.focusRow && (
                  <InvoicePreviewModal invoiceId={store.ui.focusRow} />
                )}
            </PreviewCard>
          )}

          {store.ui.showShortcutsPanel && (
            <PreviewCard>
              <ShortcutsPanel />
            </PreviewCard>
          )}
        </div>
      </div>
    </div>
  );
});
