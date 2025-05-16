import { useMemo } from 'react';

import { match } from 'ts-pattern';

import { TableIdType } from '@shared/types/__generated__/graphql.types';

export const useTablePlaceholder = (tableIdType?: TableIdType) => {
  return useMemo(() => {
    return match(tableIdType)
      .returnType<string>()
      .with(TableIdType.Organizations, () => 'Leads')
      .with(TableIdType.Customers, () => 'Customers')
      .with(TableIdType.Contacts, () => 'Leads')
      .with(TableIdType.Contracts, () => 'Contracts')
      .with(TableIdType.Opportunities, () => 'Opportunities')
      .with(
        TableIdType.PastInvoices,
        TableIdType.UpcomingInvoices,
        () => 'Invoices',
      )
      .with(TableIdType.Tasks, () => 'Tasks')
      .otherwise(() => 'results');
  }, [tableIdType]);
};
