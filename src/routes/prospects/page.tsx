import { useNavigate, useSearchParams } from 'react-router-dom';

import { useUnmount } from 'usehooks-ts';
import { observer } from 'mobx-react-lite';
import { FinderTable } from '@finder/components/FinderTable';
import { FinderFilters } from '@finder/components/FinderFilters/FinderFilters';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { ButtonGroup } from '@ui/form/ButtonGroup';
import { TableIdType, TableViewType } from '@graphql/types';
import { PreviewCard } from '@shared/components/PreviewCard';
import { ViewSettings } from '@shared/components/ViewSettings';
import { TaskDetails } from '@shared/components/TaskDetails/TaskDetails';
import { ShortcutsPanel } from '@shared/components/PreviewCard/components/ShortcutsPanel';

import { Search } from './src/components/Search';
import { ProspectsBoard } from './src/components/ProspectsBoard';

export const ProspectsBoardPage = observer(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const store = useStore();
  const opportunitiesView = store.tableViewDefs.getById(
    store.tableViewDefs.opportunitiesTablePreset ?? '',
  );

  useUnmount(() => {
    store.ui.setShortcutsPanel(false);
  });

  const showFinder = searchParams.get('show') === 'finder';
  const showPreviewCard = store.ui.showPreviewCard && !showFinder;

  return (
    <div className='flex flex-col text-grayModern-700 overflow-hidden bg-white'>
      <div className='flex justify-between pr-4 border-b border-b-grayModern-2grayModerng-grayModern-25'>
        <Search />

        <div className='flex items-center gap-2'>
          <Button
            size='xs'
            colorScheme='primary'
            leftIcon={<Icon name='plus' />}
            onClick={() => {
              store.ui.commandMenu.setType('ChooseOpportunityStage');
              store.ui.commandMenu.setOpen(true);
            }}
          >
            Opportunity
          </Button>
        </div>
      </div>

      <div className='flex'>
        <div className=' w-full overflow-auto'>
          <div
            className={cn(
              'flex justify-between px-4 py-2  items-start',
              !showFinder && 'border-b-[1px] mb-2 border-grayModern-200',
            )}
          >
            <div className='flex justify-end items-center gap-2'>
              {showFinder && (
                <FinderFilters
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  type={TableViewType.Opportunities as any}
                  tableId={TableIdType.OpportunitiesRecords}
                />
              )}
            </div>
            <div className='flex items-center self-end gap-2'>
              <ButtonGroup className='flex items-center w-[252px]'>
                <Button
                  size='xs'
                  colorScheme='grayModern'
                  dataTest='prospects-board-button'
                  onClick={() => navigate('/prospects')}
                  className={cn('px-4 w-full flex-1', {
                    selected: !showFinder,
                  })}
                  leftIcon={
                    <Icon
                      name='columns-03'
                      className={cn(!showFinder && 'text-primary-700', {
                        selected: !showFinder,
                      })}
                    />
                  }
                >
                  Board
                </Button>
                <Button
                  size='xs'
                  dataTest={'prospects-list-button'}
                  className={cn('px-4 w-full flex-1', {
                    selected: showFinder,
                  })}
                  onClick={() =>
                    navigate(`?show=finder&preset=${opportunitiesView?.id}`)
                  }
                  leftIcon={
                    <Icon
                      name='menu-01'
                      className={cn(showFinder && 'text-primary-700', {
                        selected: showFinder,
                      })}
                    />
                  }
                >
                  List
                </Button>
              </ButtonGroup>
              <ViewSettings
                type={TableViewType.Opportunities}
                tableId={
                  showFinder
                    ? TableIdType.OpportunitiesRecords
                    : TableIdType.Opportunities
                }
              />
            </div>
          </div>
          {showFinder && <FinderTable />}
          {!showFinder && <ProspectsBoard />}
        </div>

        {store.ui.showShortcutsPanel && (
          <PreviewCard>
            <ShortcutsPanel />
          </PreviewCard>
        )}

        {showPreviewCard && (
          <PreviewCard>
            <TaskDetails id={store.ui.focusRow!} />
          </PreviewCard>
        )}
      </div>
    </div>
  );
});
