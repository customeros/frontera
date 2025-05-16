import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useTablePlaceholder } from '@finder/hooks/useTablePlaceholder';

import { useStore } from '@shared/hooks/useStore';

interface SearchBarFilterDataProps {
  dataTest?: string;
}

export const SearchBarFilterData = observer(
  ({ dataTest }: SearchBarFilterDataProps) => {
    const store = useStore();
    const [searchParams] = useSearchParams();
    const preset = searchParams.get('preset');
    const tableView = store.tableViewDefs.value.get(preset || '');

    const tablePlaceholder = useTablePlaceholder(tableView?.value.tableId);

    return (
      <div className='flex flex-row items-center gap-1 ml-[20px]'>
        <div
          data-test={dataTest ? dataTest : ''}
          className={'font-medium flex items-center gap-1 break-keep w-max '}
        >
          {` ${tablePlaceholder}`}
        </div>
      </div>
    );
  },
);
