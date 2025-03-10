import { observer } from 'mobx-react-lite';
import { useCurrentViewDef } from '@finder/hooks/useCurrentViewDef';

import { TableViewType } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';
import { PreviewCard } from '@shared/components/PreviewCard';
import { ContactDetails } from '@shared/components/ContactDetails';
import { TaskDetails } from '@shared/components/TaskDetails/TaskDetails';
import { OrganizationDetails } from '@shared/components/OrganizationDetails';
import { InvoicePreviewModal } from '@organization/components/Timeline/PastZone/events/invoice/InvoicePreviewModal';

export const PreviewPanel = observer(() => {
  const store = useStore();
  const { tableViewDef } = useCurrentViewDef();

  if (!store.ui.showPreviewCard && !store.ui.isSearching) {
    return null;
  }

  return (
    <PreviewCard
      isInvoice={tableViewDef?.value.tableType === TableViewType.Invoices}
    >
      {tableViewDef?.value.tableType === TableViewType.Contacts && (
        <ContactDetails isExpandble={false} id={String(store.ui.focusRow)} />
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

      {tableViewDef?.value.tableType === TableViewType.Tasks &&
        store.ui.focusRow && <TaskDetails id={store.ui.focusRow} />}
    </PreviewCard>
  );
});
