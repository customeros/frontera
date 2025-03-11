import { useMemo } from 'react';

import { match } from 'ts-pattern';

import { TableViewType } from '@graphql/types';
import {
  flowsMap,
  tasksMap,
  contractsMap,
  opportunitiesMap,
  contactsOptionsMap,
  invoicesOptionsMap,
  flowsHelperTextMap,
  tasksHelperTextMap,
  contactsHelperTextMap,
  invoicesHelperTextMap,
  contractsHelperTextMap,
  organizationsOptionsMap,
  organizationsHelperTextMap,
  opportunitiesHelperTextMap,
} from '@shared/components/ViewSettings/EditColumns/columnOptions.ts';

export const useTableColumnOptionsMap = (type?: TableViewType) => {
  return useMemo(
    () =>
      match(type)
        .with(TableViewType.Contacts, () => [
          contactsOptionsMap,
          contactsHelperTextMap,
        ])
        .with(TableViewType.Invoices, () => [
          invoicesOptionsMap,
          invoicesHelperTextMap,
        ])
        .with(TableViewType.Contracts, () => [
          contractsMap,
          contractsHelperTextMap,
        ])
        .with(TableViewType.Opportunities, () => [
          opportunitiesMap,
          opportunitiesHelperTextMap,
        ])
        .with(TableViewType.Flow, () => [flowsMap, flowsHelperTextMap])
        .with(TableViewType.Tasks, () => [tasksMap, tasksHelperTextMap])
        .otherwise(() => [organizationsOptionsMap, organizationsHelperTextMap]),
    [type],
  );
};
