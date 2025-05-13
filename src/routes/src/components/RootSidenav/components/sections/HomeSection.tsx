import React from 'react';
import { useLocation } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Preferences } from '@shared/components/RootSidenav/hooks';
import { TableIdType } from '@shared/types/__generated__/graphql.types';

import { RootSidenavItem } from '../RootSidenavItem';
import { CollapsibleSection } from '../CollapsibleSection';
import { WelcomeSidenavItem } from '../WelcomeSideNavItem';

interface HomeSectionProps {
  preferences: Preferences;
  handleItemClick: (data: string) => void;
  togglePreference: (data: keyof Preferences) => void;
  checkIsActive: (
    path: string[],
    options?: { preset: string | Array<string> },
  ) => boolean;
}

export const HomeSection = observer(
  ({
    preferences,
    togglePreference,
    handleItemClick,
    checkIsActive,
  }: HomeSectionProps) => {
    const store = useStore();
    const { pathname } = useLocation();

    const tableViewDefsList = store.tableViewDefs.toArray();

    const homeViews = tableViewDefsList.filter(
      (c) => c.value.tableId === TableIdType.Tasks,
    );

    return (
      <CollapsibleSection
        title='Home'
        isOpen={preferences.isHomeOpen}
        onToggle={() => togglePreference('isHomeOpen')}
        icon={
          <Icon
            name='home-smile'
            className='text-grayModern-500 group-hover:text-grayModern-700 size-4'
          />
        }
      >
        {store.globalCache.value?.user?.onboarding?.showOnboardingPage && (
          <div className='ml-[5px]'>
            <WelcomeSidenavItem
              label='Welcome'
              icon={() => <></>}
              isActive={pathname.includes('welcome')}
              onClick={() => handleItemClick(`welcome`)}
            />
          </div>
        )}

        {preferences.isHomeOpen &&
          homeViews.map((view) => (
            <div key={view.value.id} className='ml-[17px]'>
              <RootSidenavItem
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
