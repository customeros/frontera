import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useKey } from 'rooks';
import { observer } from 'mobx-react-lite';
import { InvoiceStore } from '@store/Invoices/Invoice.store.ts';

import { Table } from '@ui/presentation/Table';
import { useStore } from '@shared/hooks/useStore';
import { EmptyState } from '@shared/components/Invoice/EmptyState/EmptyState';
import { columns } from '@organization/components/Tabs/panels/InvoicesPanel/Columns/Columns';
import { OrganizationPanel } from '@organization/components/Tabs/shared/OrganizationPanel/OrganizationPanel';

export const InvoicesPanel = observer(() => {
  const id = useParams()?.id as string;
  const tableRef = useRef(null);
  const [focusedRow, setFocusedRow] = useState<string | null>(null);

  const store = useStore();
  const invoices = store.invoices
    .toComputedArray((a) => a)
    .filter(
      (e) => e?.value?.organization?.metadata?.id === id && !e.value.dryRun,
    );

  if (!store.invoices.isLoading && invoices.length === 0) {
    return (
      <div className='flex justify-center'>
        <EmptyState />
      </div>
    );
  }

  const onPressSpace = () => {
    if (!focusedRow) return;
    const params = new URLSearchParams(window.location.search);
    const currentPreview = params.get('preview');

    if (currentPreview === focusedRow) {
      params.delete('preview');
    } else {
      params.set('preview', focusedRow);
    }

    window.history.pushState({}, '', `?${params.toString()}`);
    window.dispatchEvent(new Event('popstate'));
  };

  useKey('Space', () => {
    onPressSpace();
  });

  return (
    <OrganizationPanel title='Account'>
      <div className='-ml-6 -mr-[33px]'>
        <Table<InvoiceStore>
          rowHeight={28}
          columns={columns}
          tableRef={tableRef}
          data={invoices ?? []}
          borderColor='gray.100'
          fullRowSelection={false}
          totalItems={invoices.length}
          isLoading={store.invoices.isLoading}
          onFocusedRowChange={(index) => {
            const row = invoices[index ?? 0];

            row?.number && setFocusedRow(row.value.invoiceNumber);
          }}
        />
      </div>
    </OrganizationPanel>
  );
});
