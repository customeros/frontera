import { useState, ReactNode, useEffect } from 'react';

import { cn } from '@ui/utils/cn';
import { Spinner } from '@ui/feedback/Spinner';
import {
  ScrollAreaRoot,
  ScrollAreaThumb,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
} from '@ui/utils/ScrollArea';

interface OrganizationPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  bgImage?: string;
  withFade?: boolean;
  isLoading?: boolean;
  scrollable?: boolean;
  actionItem?: ReactNode;
  leftActionItem?: ReactNode;
  shouldBlockPanelScroll?: boolean; // fix for https://linear.app/customer-os/issue/COS-619/scrollbar-overlaps-the-renewal-modals-in-safari
}

export const OrganizationPanel = ({
  bgImage,
  title,
  isLoading,
  actionItem,
  leftActionItem,
  children,
  withFade = false,
  scrollable = true,
  shouldBlockPanelScroll = false,
  ...props
}: OrganizationPanelProps) => {
  const [isMounted, setIsMounted] = useState(!withFade);

  useEffect(() => {
    if (!withFade) return;
    setIsMounted(true);
  }, []);

  return (
    <div
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : '' }}
      className={cn('flex flex-col h-full p-0 bg-no-repeat bg-contain')}
      {...props}
    >
      {title && (
        <div className='flex justify-between pb-4 px-4 pt-3'>
          <div className='flex items-center relative'>
            {leftActionItem && leftActionItem}
            <span className='text-sm text-grayModern-700 font-medium'>
              {title}
            </span>
            {isLoading && (
              <Spinner
                size='sm'
                label='syncing'
                className='text-grayModern-300 fill-grayModern-700 w-3 h-3 ml-1 absolute left-[-20px]'
              />
            )}
          </div>

          {actionItem && actionItem}
        </div>
      )}
      {scrollable ? (
        <ScrollAreaRoot>
          <ScrollAreaViewport>
            <div
              className={cn(
                isMounted ? 'opacity-100' : 'opacity-0',
                'flex flex-col space-y-2 justify-start h-[calc(100vh-78px)] px-4 pb-8 transition-opacity duration-300 ease-in-out',
              )}
            >
              {children}
            </div>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation='vertical'>
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </ScrollAreaRoot>
      ) : (
        children
      )}
    </div>
  );
};
