import { useSearchParams } from 'react-router-dom';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { useTablePlaceholder } from '@finder/hooks/useTablePlaceholder';

import { TableViewType } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';

interface SearchBarFilterDataProps {
  dataTest?: string;
}

export const SearchBarFilterData = observer(
  ({ dataTest }: SearchBarFilterDataProps) => {
    const store = useStore();
    const [searchParams] = useSearchParams();
    const preset = searchParams.get('preset');
    const tableView = store.tableViewDefs.getById(preset || '');

    const { multi: multiResultPlaceholder, single: singleResultPlaceholder } =
      useTablePlaceholder(tableView?.value.tableId);

    const totalResults = match(tableView?.value.tableType)
      .returnType<number>()
      .with(
        TableViewType.Organizations,
        () => store.organizations.availableCounts.get(preset ?? '') ?? 0,
      )
      .with(
        TableViewType.Contacts,
        () => store.contacts.availableCounts.get(preset ?? '') ?? 0,
      )
      .otherwise(() => store.ui.searchCount);

    const tableName =
      totalResults === 1 ? singleResultPlaceholder : multiResultPlaceholder;

    const hideSearch =
      tableView?.value?.tableType === TableViewType.Organizations ||
      tableView?.value?.tableType === TableViewType.Contacts ||
      tableView?.value?.tableType === TableViewType.Tasks;

    return (
      <div className='flex flex-row items-center gap-1'>
        <div
          data-test={dataTest ? dataTest : ''}
          className={'font-medium flex items-center gap-1 break-keep w-max '}
        >
          {`${totalResults} ${tableName}` + (hideSearch ? '' : ':')}
        </div>
      </div>
    );
  },
);
