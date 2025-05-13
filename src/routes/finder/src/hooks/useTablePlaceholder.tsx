import { useMemo } from 'react';

import { match } from 'ts-pattern';

import { TableIdType } from '@shared/types/__generated__/graphql.types';

export const useTablePlaceholder = (tableIdType?: TableIdType) => {
  return useMemo(() => {
    return match(tableIdType)
      .returnType<{
        multi: string;
        single: string;
      }>()
      .with(TableIdType.Organizations, () => ({
        multi: 'companies',
        single: 'company',
      }))
      .with(TableIdType.Customers, () => ({
        multi: 'customers',
        single: 'customer',
      }))
      .with(TableIdType.Contacts, () => ({
        multi: 'contacts',
        single: 'contacts',
      }))
      .with(TableIdType.Contracts, () => ({
        multi: 'contracts',
        single: 'contract',
      }))
      .with(TableIdType.Opportunities, () => ({
        multi: 'opportunities',
        single: 'opportunity',
      }))
      .with(TableIdType.PastInvoices, TableIdType.UpcomingInvoices, () => ({
        multi: 'invoices',
        single: 'invoice',
      }))
      .with(TableIdType.Tasks, () => ({
        multi: 'tasks',
        single: 'task',
      }))
      .otherwise(() => ({
        multi: 'results',
        single: 'result',
      }));
  }, [tableIdType]);
};
