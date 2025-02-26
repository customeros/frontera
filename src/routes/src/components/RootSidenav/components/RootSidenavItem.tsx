import { ReactElement, MouseEventHandler } from 'react';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { buttonSize } from '@ui/form/Button/Button';
import { ghostButton } from '@ui/form/Button/Button.variants';

interface SidenavItemProps {
  href?: string;
  label: string;
  dataTest?: string;
  isActive?: boolean;
  onClick?: () => void;

  rightElement?: ReactElement | null;
  icon: ((isActive: boolean) => ReactElement) | ReactElement;
}

export const RootSidenavItem = observer(
  ({ label, icon, onClick, isActive = false, dataTest }: SidenavItemProps) => {
    const handleClick: MouseEventHandler = (e) => {
      e.preventDefault();
      onClick?.();
    };

    const dynamicClasses = cn(
      isActive
        ? ['font-medium', 'bg-grayModern-100']
        : ['font-normal', 'bg-transparent'],
    );

    return (
      <div
        data-test={dataTest}
        onClick={handleClick}
        className={cn(
          buttonSize({ size: 'sm' }),
          (ghostButton({ colorScheme: 'grayModern' }),
          `flex w-full justify-start gap-2 px-3 text-grayModern-700 cursor-pointer hover:bg-grayModern-100 *:hover:text-grayModern-700  group focus:shadow-EditableSideNavItemFocus mb-[2px] rounded-md ${dynamicClasses}`),
        )}
      >
        <div className='mt-[-1px]'>
          {typeof icon === 'function' ? icon(isActive!) : icon}
        </div>
        <div
          aria-selected={isActive}
          className={cn(
            'w-full text-justify whitespace-nowrap overflow-hidden overflow-ellipsis',
          )}
        >
          {label}
        </div>
      </div>
    );
  },
);
