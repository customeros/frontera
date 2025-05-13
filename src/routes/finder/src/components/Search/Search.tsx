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
import { Input } from '@ui/form/Input/Input';
import { useStore } from '@shared/hooks/useStore';
import { Button } from '@ui/form/Button/Button.tsx';
import { TableIdType, TableViewType } from '@graphql/types';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { UserPresence } from '@shared/components/UserPresence';
import { Tooltip, TooltipProps } from '@ui/overlay/Tooltip/Tooltip';
import {
  InputGroup,
  LeftElement,
  RightElement,
} from '@ui/form/InputGroup/InputGroup';

export const Search = observer(() => {
  const store = useStore();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [searchParams] = useSearchParams();
  const preset = searchParams.get('preset');

  const tableViewDef = store.tableViewDefs.getById(preset || '');

  const tableType = tableViewDef?.value?.tableType;
  const totalResults = store.ui.searchCount;

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

  const placeholder = match(tableType)
    .with(TableViewType.Flow, () => 'by flow name...')
    .with(TableViewType.Contacts, () => '')
    .with(TableViewType.Contracts, () =>
      !store.ui.isSearching ? '/ to search' : 'by contract name...',
    )
    .with(TableViewType.Organizations, () => 'Search')
    .with(TableViewType.Invoices, () =>
      !store.ui.isSearching ? '/ to search' : 'by contract name...',
    )
    .with(TableViewType.Opportunities, () => 'by name, company or owner...')
    .with(TableViewType.Tasks, () => '')
    .otherwise(() => 'by company name...');

  const createNewEntityModalType:
    | null
    | 'CreateNewFlow'
    | 'AddContactsBulk'
    | 'AddNewOrganization' = match(tableType)
    .with(TableViewType.Flow, (): 'CreateNewFlow' => 'CreateNewFlow')
    .with(TableViewType.Contacts, (): 'AddContactsBulk' => 'AddContactsBulk')
    .with(
      TableViewType.Organizations,
      (): 'AddNewOrganization' => 'AddNewOrganization',
    )
    .otherwise(() => null);

  const allowCreation =
    ![TableIdType.Contracts, TableIdType.FlowActions].includes(
      tableViewDef?.value?.tableId as TableIdType,
    ) &&
    totalResults === 0 &&
    !!searchParams.get('search');

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
      className='flex items-center justify-between pr-1 w-full gap-2 bg-white border-b'
    >
      <div className='flex items-center gap-4 w-full'>
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
        <InputGroup className='relative w-full bg-transparent hover:border-transparent focus-within:border-transparent focus-within:hover:border-transparent gap-1'>
          {tableViewDef?.value.tableType !== TableViewType.Contacts &&
            tableViewDef?.value.tableType !== TableViewType.Tasks && (
              <LeftElement>
                <Icon name='search-sm' />
              </LeftElement>
            )}
          <Input
            size='md'
            ref={inputRef}
            autoCorrect='off'
            spellCheck={false}
            variant='unstyled'
            placeholder={placeholder}
            defaultValue={searchParams.get('search') ?? ''}
            onBlur={() => {
              store.ui.setIsSearching(null);
              wrapperRef.current?.removeAttribute('data-focused');
            }}
            onClick={() => {
              if (tableType === TableViewType.Organizations) {
                store.ui.commandMenu.toggle('AddNewOrganization');
              }
            }}
            readOnly={
              tableType === TableViewType.Organizations ||
              tableType === TableViewType.Contacts ||
              tableType === TableViewType.Tasks
            }
            onFocus={() => {
              if (tableType === TableViewType.Organizations) return;
              store.ui.setIsSearching('organizations');
              wrapperRef.current?.setAttribute('data-focused', '');
            }}
            className={cn(' placeholder:text-grayModern-700', {
              'cursor-default':
                tableType === TableViewType.Contacts ||
                tableType === TableViewType.Tasks,
              'cursor-pointer': tableType === TableViewType.Organizations,
            })}
            onKeyUp={(e) => {
              if (
                e.code === 'Escape' ||
                e.code === 'ArrowUp' ||
                e.code === 'ArrowDown'
              ) {
                inputRef.current?.blur();
                store.ui.setIsSearching(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                e.currentTarget.select();
              }

              if (e.key === 'Enter' && allowCreation) {
                e.stopPropagation();
                e.preventDefault();

                if (createNewEntityModalType) {
                  store.ui.commandMenu.setType(createNewEntityModalType);
                  store.ui.commandMenu.setOpen(true);
                }
              }
              e.stopPropagation();
            }}
          />
          <RightElement className='flex items-center gap-4'>
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
          </RightElement>
        </InputGroup>
      </div>

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
