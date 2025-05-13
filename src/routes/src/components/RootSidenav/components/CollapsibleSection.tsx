import { ReactNode } from 'react';

import { cn } from '@ui/utils/cn.ts';
import { Icon } from '@ui/media/Icon';

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onToggle: () => void;
}

export const CollapsibleSection = ({
  title,
  isOpen,
  onToggle,
  children,
  icon,
}: CollapsibleSectionProps) => {
  return (
    <div>
      <div className='flex items-center justify-center px-3 pt-1.5 pb-1 gap-2 border-[1px] border-transparent group'>
        <div className='flex items-center justify-center group-hover:text-grayModern-700'>
          {icon}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            'w-full gap-1 flex justify-flex-start items-center cursor-pointer text-grayModern-500 group-hover:text-grayModern-700 transition-colors',
          )}
        >
          <div className='flex items-center gap-1'>
            <span className='text-sm text-grayModern-700'>{title}</span>

            <Icon
              name='chevron-down'
              className={cn('w-3 h-3', {
                'transform -rotate-90': !isOpen,
              })}
            />
          </div>
        </button>
      </div>

      {isOpen && <div className='mt-1'>{children}</div>}
    </div>
  );
};
