import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useKey } from 'rooks';
import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { InvoiceStore } from '@store/Invoices/Invoice.store.ts';

import { Table } from '@ui/presentation/Table';
import { useStore } from '@shared/hooks/useStore';
import { EmptyState } from '@shared/components/Invoice/EmptyState/EmptyState';
import { columns } from '@organization/components/Tabs/panels/InvoicesPanel/Columns/Columns';
import { OrganizationPanel } from '@organization/components/Tabs/shared/OrganizationPanel/OrganizationPanel';

export const InvoicesPanel = observer(() => {
  const id = useParams()?.id as string;
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [focusedRow, setFocusedRow] = useState<string | null>(null);

  const store = useStore();
  const invoices = store.invoices
    .toComputedArray((a) => a)
    .filter(
      (e) => e?.value?.organization?.metadata?.id === id && !e.value.dryRun,
    );

  useKey('Space', () => {
    onPressSpace();
  });

  if (!store.invoices.isLoading && invoices.length === 0) {
    return (
      <div className='flex justify-center'>
        <EmptyState
          id={id}
          companyName={registry.get('organizations').get(id)?.name ?? ''}
        />
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

    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <OrganizationPanel title='Invoices' scrollable={false}>
      <div className='-ml-6 -mr-[33px] pl-[8px]'>
        <Table<InvoiceStore>
          rowHeight={28}
          columns={columns}
          tableRef={tableRef}
          data={invoices ?? []}
          fullRowSelection={false}
          borderColor='grayModern.100'
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
