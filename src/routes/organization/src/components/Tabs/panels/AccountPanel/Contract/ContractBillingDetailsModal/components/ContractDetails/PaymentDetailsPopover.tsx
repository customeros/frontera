import { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@ui/utils/cn.ts';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/overlay/Popover/Popover.tsx';

interface PaymentDetailsPopoverProps {
  agentId?: string;
  content?: string;
  children: ReactNode;
  withNavigation?: boolean;
}

export const PaymentDetailsPopover: FC<PaymentDetailsPopoverProps> = ({
  withNavigation,
  content,
  children,
  agentId,
}) => {
  const navigate = useNavigate();

  return (
    <Popover>
      <PopoverTrigger disabled={!content?.length}>
        <div className='w-full'>{children}</div>
      </PopoverTrigger>
      <PopoverContent
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        className={cn(
          content?.length ? 'block' : 'none',
          'w-fit bg-grayModern-700 text-white rounded-md text-sm border-none z-[50000]',
        )}
      >
        <div className='flex'>
          <p className='text-xs mr-1 text-white'>{content}</p>

          {withNavigation && (
            <span
              tabIndex={0}
              role='button'
              className={'text-xs underline text-white'}
              onClick={() => {
                navigate(`/agents/${agentId}`);
              }}
            >
              Cashflow Guardian
            </span>
          )}
          <span className='ml-1 text-xs'>agent</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};
