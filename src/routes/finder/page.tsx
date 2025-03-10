import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { FinderTable } from '@finder/components/FinderTable';
import { FiltersContainer } from '@finder/components/FiltersContainer';

import { useStore } from '@shared/hooks/useStore';
import { PreviewCard } from '@shared/components/PreviewCard';
import { ShortcutsPanel } from '@shared/components/PreviewCard/components/ShortcutsPanel';

import { Search } from './src/components/Search';
import { PreviewPanel } from './src/components/PreviewPanel';
import { usePreviewPanel } from './src/hooks/usePreviewPanel';

export const FinderPage = observer(() => {
  const store = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const preset = searchParams.get('preset');

  const defaultPreset = store.tableViewDefs?.defaultPreset;
  const currentPreset = store.tableViewDefs
    ?.toArray()
    .find((e) => e.value.id === preset)?.value?.name;

  useEffect(() => {
    if (!preset && defaultPreset) {
      setSearchParams(`?preset=${defaultPreset}`);
    }
  }, [preset, setSearchParams, defaultPreset]);

  useEffect(() => {
    match(currentPreset)
      .with('All orgs', () => {
        store.ui.commandMenu.setType('OrganizationHub');
      })

      .otherwise(() => {
        store.ui.commandMenu.setType('GlobalHub');
      });
  }, [preset]);

  usePreviewPanel();

  return (
    <div className='flex w-full items-start h-full '>
      <div className='w-[100%] bg-white h-full'>
        <div className='w-full'>
          <Search />
        </div>
        <div className='flex'>
          <div className=' w-full overflow-auto'>
            <FiltersContainer />
            <FinderTable />
          </div>

          <PreviewPanel />

          {store.ui.showShortcutsPanel && (
            <PreviewCard>
              <ShortcutsPanel />
            </PreviewCard>
          )}
        </div>
      </div>
    </div>
  );
});
