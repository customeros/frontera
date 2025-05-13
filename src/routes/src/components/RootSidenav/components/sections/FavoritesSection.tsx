import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Preferences } from '@shared/components/RootSidenav/hooks';
import { EditableSideNavItem } from '@shared/components/RootSidenav/components/EditableSidenavItem';

import { CollapsibleSection } from '../CollapsibleSection';

interface FavoritesSectionProps {
  preferences: Preferences;
  handleItemClick: (data: string) => void;
  togglePreference: (data: keyof Preferences) => void;
  checkIsActive: (
    path: string[],
    options?: { preset: string | Array<string> },
  ) => boolean;
}

export const FavoritesSection = observer(
  ({
    preferences,
    togglePreference,
    handleItemClick,
    checkIsActive,
  }: FavoritesSectionProps) => {
    const store = useStore();
    const tableViewDefsList = store.tableViewDefs.toArray();

    const favoritesView =
      tableViewDefsList
        .filter((c) => !c.value.isPreset && !c.value.isShared)
        .sort((a, b) => a.value.order - b.value.order) ?? [];

    if (!favoritesView.length) return null;

    return (
      <CollapsibleSection
        title='My views'
        isOpen={preferences.isFavoritesOpen}
        onToggle={() => togglePreference('isFavoritesOpen')}
        icon={
          <Icon
            name='user-01'
            className='text-grayModern-500 group-hover:text-grayModern-700 size-4'
          />
        }
      >
        {preferences.isFavoritesOpen &&
          favoritesView.map((view) => (
            <div key={view.value.id} className='ml-[17px]'>
              <EditableSideNavItem
                id={view.value.id}
                icon={() => <></>}
                key={view.value.id}
                label={view.value.name}
                dataTest={`side-nav-item-${view.value.name}`}
                isActive={checkIsActive(['finder'], {
                  preset: view.value.id,
                })}
                onClick={() =>
                  handleItemClick(`finder?preset=${view.value.id}`)
                }
              />
            </div>
          ))}
      </CollapsibleSection>
    );
  },
);
