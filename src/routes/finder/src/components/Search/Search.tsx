import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { match } from 'ts-pattern';
import { useKeyBindings } from 'rooks';
import { observer } from 'mobx-react-lite';
import { TableViewMenu } from '@finder/components/TableViewMenu/TableViewMenu';
import { CreateSequenceButton } from '@finder/components/Search/CreateSequenceButton.tsx';
import { TableViewsToggleNavigation } from '@finder/components/TableViewsToggleNavigation';
import { SearchBarFilterData } from '@finder/components/SearchBarFilterData/SearchBarFilterData';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Button } from '@ui/form/Button/Button.tsx';
import { TableIdType, TableViewType } from '@graphql/types';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { UserPresence } from '@shared/components/UserPresence';
import { Tooltip, TooltipProps } from '@ui/overlay/Tooltip/Tooltip';

export const Search = observer(() => {
  const store = useStore();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [searchParams] = useSearchParams();
  const preset = searchParams.get('preset');

  const tableViewDef = store.tableViewDefs.getById(preset || '');

  const tableType = tableViewDef?.value?.tableType;

  useKeyBindings(
    {
      '/': () => {
        setTimeout(() => {
          if (tableType === TableViewType.Organizations) {
            store.ui.commandMenu.toggle('AddNewOrganization');
          } else {
            inputRef.current?.focus();
          }
        }, 0);
      },
    },
    {
      when:
        !store.ui.isEditingTableCell &&
        !store.ui.isFilteringTable &&
        !store.ui.commandMenu.isOpen,
    },
  );

  const [showAddButton, addButtonProps, addButtonTooltipProps] = match(
    tableType,
  )
    .returnType<[boolean, object, Pick<TooltipProps, 'label'>]>()
    .with(TableViewType.Contacts, () => [
      true,
      {
        leftIcon: <Icon name='plus' />,
        children: 'Lead',
        onClick: () => store.ui.commandMenu.toggle('AddContactsBulk'),
      },
      {
        label: <span>Add one or more</span>,
      },
    ])
    .with(TableViewType.Organizations, () => [
      true,
      {
        leftIcon: <Icon name='plus' />,
        children: 'Lead',
        onClick: () => store.ui.commandMenu.toggle('AddNewOrganization'),
      },
      {
        label: (
          <span className='flex items-center gap-3'>
            Add or search
            <div className='bg-grayModern-600 text-xs min-h-4 min-w-4 rounded flex justify-center items-center'>
              /
            </div>
          </span>
        ),
      },
    ])
    .with(TableViewType.Tasks, () => [
      true,
      {
        leftIcon: <Icon name='plus' />,
        children: 'Task',
        onClick: () =>
          store.tasks.createTask().then((id) => {
            store.ui.setShowPreviewCard(true);
            store.ui.setFocusRow(id!);
          }),
      },
      {
        label: <span>Create a task</span>,
      },
    ])
    .otherwise(() => [false, {}, { label: null }]);

  return (
    <div
      ref={wrapperRef}
      className='flex items-center justify-between pr-1 py-[5px] mb-[1px] w-full gap-2 bg-white border-b'
    >
      <div className='flex items-center gap-3 w-full'>
        <div className='flex items-center gap-4'>
          <SearchBarFilterData dataTest={'search-orgs'} />
          <TableViewsToggleNavigation />
          {tableViewDef?.value.tableId !== TableIdType.FlowActions &&
            tableViewDef?.value.tableType !== TableViewType.Invoices && (
              <TableViewMenu />
            )}
          {tableViewDef?.value.tableType === TableViewType.Invoices && (
            <Tooltip
              label={
                tableViewDef?.value.tableId === TableIdType.UpcomingInvoices
                  ? 'Download CSV of future invoices'
                  : 'Download CSV of past invoices'
              }
            >
              <IconButton
                size='xs'
                variant='ghost'
                icon={<Icon name='download-02' />}
                aria-label='Download csv invoices'
                onClick={() => {
                  tableViewDef?.value.tableId === TableIdType.UpcomingInvoices
                    ? store.files.downloadUpcomingInvoice()
                    : store.files.downloadPastInvoice();
                }}
              />
            </Tooltip>
          )}
        </div>
        {tableViewDef?.value.tableType !== TableViewType.Contacts &&
          tableViewDef?.value.tableType !== TableViewType.Tasks && (
            <div className='w-[1px] h-[20px]  bg-grayModern-200' />
          )}
        <div className='flex items-center justify-between w-full'>
          {tableViewDef?.value.tableType !== TableViewType.Contacts &&
            tableViewDef?.value.tableType !== TableViewType.Tasks && (
              <Tooltip
                label={
                  <span className='flex items-center gap-3'>
                    Search
                    <div className='bg-grayModern-600 text-xs min-h-4 min-w-4 rounded flex justify-center items-center'>
                      /
                    </div>
                  </span>
                }
              >
                <Button
                  size='xs'
                  variant='ghost'
                  colorScheme='grayModern'
                  leftIcon={<Icon name='search-sm' />}
                  onClick={(e) => {
                    e.stopPropagation();
                    store.ui.commandMenu.toggle('AddNewOrganization');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '/') {
                      e.stopPropagation();
                      store.ui.commandMenu.toggle('AddNewOrganization');
                    }
                  }}
                >
                  Search
                </Button>
              </Tooltip>
            )}
          <div className='flex items-center gap-4 w-full justify-end'>
            <UserPresence
              channelName={`finder:${store.session.value.tenant}`}
            />

            {showAddButton && (
              <Tooltip {...addButtonTooltipProps}>
                <Button
                  size='xs'
                  className='mr-4'
                  variant='outline'
                  colorScheme='primary'
                  {...addButtonProps}
                />
              </Tooltip>
            )}
          </div>
        </div>
      </div>
      {(tableViewDef?.value.tableType === TableViewType.Contacts ||
        tableViewDef?.value.tableType === TableViewType.Organizations) && (
        <Button
          size='xs'
          variant='ghost'
          leftIcon={<Icon name='upload-04' />}
          className={cn(
            'ml-2 mr-2',
            store.ui.showLeadSources && 'bg-grayModern-100',
          )}
          onClick={() => {
            store.ui.setShowLeadSources(true);
            store.ui.setShowPreviewCard(false);
          }}
        >
          Lead sources
        </Button>
      )}

      {tableViewDef?.value.tableId === TableIdType.FlowActions && (
        <CreateSequenceButton />
      )}
      <span ref={measureRef} className={`z-[-1] absolute h-0 invisible flex`}>
        <div className='ml-2'>{/* <SearchBarFilterData /> */}</div>
        {inputRef?.current?.value ?? ''}
      </span>
    </div>
  );
});
