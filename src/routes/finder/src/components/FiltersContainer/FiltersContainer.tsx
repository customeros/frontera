import { useSearchParams } from 'react-router-dom';
import { useEffect, MouseEventHandler } from 'react';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { Divider } from '@ui/presentation/Divider';
import { ViewSettings } from '@shared/components/ViewSettings/ViewSettings';
import {
  TableIdType,
  TableViewType,
} from '@shared/types/__generated__/graphql.types';

import { FinderFilters } from '../FinderFilters/FinderFilters';

export const FiltersContainer = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();

  const preset = searchParams.get('preset');

  const tableViewDef = store.tableViewDefs.getById(preset ?? '0');
  const tableId = tableViewDef?.value.tableId;
  const tableViewType = tableViewDef?.value.tableType;

  const tableType = tableViewDef?.value?.tableType;
  const filters = tableViewDef?.getFilters()?.AND?.length > 0;

  const handleAddToMyViews: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (!preset) {
      store.ui.toastError(
        `We were unable to add this view to favorites`,
        'dup-view-error',
      );

      return;
    }
    store.ui.commandMenu.toggle('DuplicateView');
    store.ui.commandMenu.setContext({
      ids: [preset],
      entity: 'TableViewDef',
    });
  };

  useEffect(() => {
    return () => {
      store.ui.setIsEditingDefaultFilters(false);
    };
  }, [tableId]);

  return (
    <div
      className={cn(
        'flex justify-between px-3 py-2 items-start',
        store.ui.isEditingDefaultFilters && 'bg-grayModern-50',
      )}
    >
      <div className='flex gap-2 items-center'>
        {store.ui.isEditingDefaultFilters && (
          <span className='text-sm text-center'>Default filters :</span>
        )}
        <FinderFilters
          tableId={tableId || TableIdType.Organizations}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type={tableType || (TableViewType.Organizations as any)}
        />
      </div>
      <div
        className={cn(
          'flex items-center gap-2',
          store.ui.isEditingDefaultFilters && 'bg-grayModern-50',
        )}
      >
        {tableViewDef?.hasFilters() && !store.ui.isEditingDefaultFilters && (
          <>
            <Button
              size='xs'
              variant='ghost'
              onClick={() => tableViewDef?.removeFilters()}
            >
              Clear
            </Button>
            {filters && (
              <Button size='xs' onClick={handleAddToMyViews}>
                Save to...
              </Button>
            )}
            <Divider className='rotate-90 w-5 mx-[-6px]' />
          </>
        )}
        {tableViewDef?.hasDefaultFilters() &&
          !store.ui.isEditingDefaultFilters && (
            <>
              <Button
                size='xs'
                variant='ghost'
                colorScheme='grayModern'
                onClick={() => store.ui.setIsEditingDefaultFilters(true)}
                leftIcon={<Icon className='size-4' name='filter-lines' />}
              >
                {tableViewDef.getNumberOfDefaultFilters()} default
              </Button>
            </>
          )}

        {!store.ui.isEditingDefaultFilters && (
          <>
            {filters && <Divider className='rotate-90 w-5 mx-[-6px]' />}
            {tableViewType && (
              <ViewSettings tableId={tableId} type={tableViewType} />
            )}
          </>
        )}
        {store.ui.isEditingDefaultFilters && (
          <Button
            size='xs'
            onClick={() => store.ui.setIsEditingDefaultFilters(false)}
          >
            Done
          </Button>
        )}
      </div>
    </div>
  );
});
