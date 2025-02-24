import { forwardRef } from 'react';

import { twMerge } from 'tailwind-merge';
import * as RadixScrollArea from '@radix-ui/react-scroll-area';

import { cn } from '@ui/utils/cn';

export type ScrollAreaRootProps = RadixScrollArea.ScrollAreaProps;
export const ScrollAreaRoot = forwardRef<HTMLDivElement, ScrollAreaRootProps>(
  ({ className, ...props }, ref) => (
    <RadixScrollArea.Root
      ref={ref}
      className={cn('w-full h-full overflow-hidden', className)}
      {...props}
    />
  ),
);

export type ScrollAreaViewportProps = RadixScrollArea.ScrollAreaViewportProps;
export const ScrollAreaViewport = forwardRef<
  HTMLDivElement,
  ScrollAreaViewportProps
>(({ className, ...props }, ref) => (
  <RadixScrollArea.Viewport
    ref={ref}
    className={cn('h-full w-full', className)}
    {...props}
  />
));

export type ScrollAreaScrollbarProps = RadixScrollArea.ScrollAreaScrollbarProps;
export const ScrollAreaScrollbar = forwardRef<
  HTMLDivElement,
  ScrollAreaScrollbarProps
>(({ className, ...props }, ref) => (
  <RadixScrollArea.Scrollbar
    ref={ref}
    className={cn(
      'flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-[160ms] ease-out hover:bg-gray-200 data-[orientation=vertical]:w-[10px] data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5',
      className,
    )}
    {...props}
  />
));

export type ScrollAreaThumbProps = RadixScrollArea.ScrollAreaThumbProps;
export const ScrollAreaThumb = forwardRef<HTMLDivElement, ScrollAreaThumbProps>(
  ({ className, ...props }, ref) => (
    <RadixScrollArea.Thumb
      ref={ref}
      className={twMerge(
        'flex-1 bg-gray-500 rounded-[10px] relative before:content-[" "] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]',
        className,
      )}
      {...props}
    />
  ),
);
