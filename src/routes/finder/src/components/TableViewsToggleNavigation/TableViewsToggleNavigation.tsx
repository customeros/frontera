import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';

import { Tabs } from '@ui/form/Tabs/Tabs';
import { useStore } from '@shared/hooks/useStore';
import { Button } from '@ui/form/Button/Button.tsx';
import { TableIdType, TableViewType } from '@graphql/types';

export const TableViewsToggleNavigation = observer(() => {
  const store = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const preset = searchParams.get('preset');
  const [tabs, setLastActivePosition] = useLocalStorage<{
    [key: string]: string;
  }>('customeros-player-last-position', { root: 'finder' });

  const tableViewDefs = store.tableViewDefs.toArray();
  const tableViewDef = store.tableViewDefs.getById(preset || '')?.value;
  const tableViewId = tableViewDef?.tableId;
  const tableViewType = tableViewDef?.tableType;

  const findPresetTable = useCallback(
    (tableIdTypes: TableIdType[]): string | null => {
      const presetTable = tableViewDefs.find(
        (def) => tableIdTypes.includes(def.value.tableId) && def.value.isPreset,
      );

      return presetTable ? presetTable.value.id : null;
    },
    [tableViewDefs],
  );

  const getTablePair = (): [string | null, string | null] => {
    switch (tableViewId) {
      case TableIdType.Organizations:
        return [
          findPresetTable([TableIdType.Organizations]),
          findPresetTable([TableIdType.Contacts]),
        ];

      case TableIdType.Contacts:
        return [
          findPresetTable([TableIdType.Organizations]),
          findPresetTable([TableIdType.Contacts]),
        ];
      case TableIdType.UpcomingInvoices:
      case TableIdType.PastInvoices:
        return [
          findPresetTable([TableIdType.UpcomingInvoices]),
          findPresetTable([TableIdType.PastInvoices]),
        ];
      default:
        return [null, null];
    }
  };

  const [firstTableDef, secondTableDef] = getTablePair();

  const handleNavigate = (newPreset: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    newParams.set('preset', newPreset);
    setSearchParams(newParams);
    setLastActivePosition({
      ...tabs,
      root: `finder?preset=${newPreset}`,
    });
  };

  const showToggle =
    (tableViewType &&
      [TableViewType.Contacts, TableViewType.Invoices].includes(
        tableViewType,
      ) &&
      tableViewDef?.isPreset) ||
    (tableViewId &&
      [
        TableIdType.Organizations,
        TableIdType.UpcomingInvoices,
        TableIdType.PastInvoices,
      ].includes(tableViewId) &&
      tableViewDef?.isPreset);

  const getButtonLabels = (): [string, string] => {
    if (
      [TableIdType.UpcomingInvoices, TableIdType.PastInvoices].includes(
        tableViewId as TableIdType,
      )
    ) {
      return ['Upcoming', 'Past'];
    }

    return ['Companies', 'Contacts'];
  };

  const [firstButtonLabel, secondButtonLabel] = getButtonLabels();

  return (
    <>
      {showToggle && firstTableDef && secondTableDef && (
        <Tabs variant='enclosed'>
          <Button
            size='xs'
            data-state={preset === firstTableDef ? 'active' : 'inactive'}
            onClick={() => firstTableDef && handleNavigate(firstTableDef)}
          >
            {firstButtonLabel}
          </Button>
          <Button
            size='xs'
            data-state={preset === secondTableDef ? 'active' : 'inactive'}
            onClick={() => secondTableDef && handleNavigate(secondTableDef)}
          >
            {secondButtonLabel}
          </Button>
        </Tabs>
      )}
    </>
  );
});
