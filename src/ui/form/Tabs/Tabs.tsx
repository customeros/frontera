import React, { useRef, useState, ReactNode, useEffect } from 'react';

import { twMerge } from 'tailwind-merge';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'enclosed' | 'subtle';
}

export const Tabs = ({
  children,
  variant = 'enclosed',
  ...props
}: TabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState({
    width: 0,
    height: 0,
    left: 0,
  });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const activeBtn = container.querySelector(
      '[data-state="active"]',
    ) as HTMLElement | null;

    if (!activeBtn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    setHighlightStyle({
      width: btnRect.width,
      height: btnRect.height,
      left: btnRect.left - containerRect.left,
    });
  }, [children]);

  return (
    <div
      {...props}
      ref={containerRef}
      className={twMerge(
        'flex items-center gap-2 relative', //
        variant === 'enclosed' && 'bg-grayModern-100 p-[2px] rounded-full',
      )}
    >
      {variant === 'enclosed' && (
        <span
          className='absolute top-[2px] left-0 bg-grayModern-25 rounded-full transition-all duration-300 pointer-events-none'
          style={{
            width: highlightStyle.width,
            height: highlightStyle.height,
            transform: `translateX(${highlightStyle.left}px)`,
          }}
        />
      )}

      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;

        const isActive = child.props['data-state'] === 'active';

        return React.cloneElement(
          child as React.ReactElement<React.HTMLAttributes<HTMLButtonElement>>,
          {
            className: twMerge(
              'text-sm font-medium transition z-10',
              (
                child as React.ReactElement<
                  React.HTMLAttributes<HTMLButtonElement>
                >
              ).props.className,
              variant === 'enclosed' && [
                isActive
                  ? 'bg-white text-primary-700 hover:text-primary-700 rounded-full border-transparent !shadow-[0]'
                  : 'text-grayModern-600 !hover:bg-grayModern-50 rounded-full border-transparent !shadow-[0] focus-visible:border-primary-500 focus-visible:border-1 focus-visible:bg-grayModern-100',
              ],
              variant === 'subtle' && [
                isActive
                  ? 'text-grayModern-800 border-grayModern-700 border-[1px] border-transparent !bg-grayModern-100 hover:bg-grayModern-100 !shadow-[0] focus-visible:border-grayModern-700 focus-visible:border-1'
                  : 'text-grayModern-600 hover:bg-grayModern-100 border-transparent focus-visible:border-grayModern-700 focus-visible:border-1 focus:bg-white bg-transparent !shadow-[0]',
              ],
            ),
          },
        );
      })}
    </div>
  );
};
