import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { FinderTable } from '@finder/components/FinderTable';
import { FiltersContainer } from '@finder/components/FiltersContainer';

import { useStore } from '@shared/hooks/useStore';
import { PreviewCard } from '@shared/components/PreviewCard';
import { ContactDetails } from '@shared/components/ContactDetails';
import { TableViewType } from '@shared/types/__generated__/graphql.types';
import { OrganizationDetails } from '@shared/components/OrganizationDetails';
import { ShortcutsPanel } from '@shared/components/PreviewCard/components/ShortcutsPanel';
import { InvoicePreviewModal } from '@organization/components/Timeline/PastZone/events/invoice/InvoicePreviewModal';

import { Search } from './src/components/Search';

export const FinderPage = observer(() => {
  const store = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const preset = searchParams.get('preset');

  const defaultPreset = store.tableViewDefs?.defaultPreset;
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

  return (
    <div className='flex w-full items-start h-full '>
      <div className='w-[100%] bg-white h-full'>
        <div className='w-full'>
          <Search />
        </div>
        <div className='flex'>
          <div className=' w-full overflow-auto'>
            <FiltersContainer />
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
