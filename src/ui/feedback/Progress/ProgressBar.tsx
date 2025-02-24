import * as RadixProgress from '@radix-ui/react-progress';

import { cn } from '@ui/utils/cn';

export const ProgressBar = ({
  className,
  style,
  value = 0,
  ...props
}: RadixProgress.ProgressProps) => {
  return (
    <RadixProgress.Root
      className={cn(
        'relative overflow-hidden bg-transparent rounded-sm h-0.5 bg-grayModern-200',
        className,
      )}
      style={{
        // Fix overflow clipping in Safari
        // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
        transform: 'translateZ(0)',
        ...style,
      }}
      {...props}
    >
      <RadixProgress.Indicator
        style={{ width: `${value}%` }}
        className='bg-grayModern-400 h-full transition-width duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)] animate-pulse'
      />
    </RadixProgress.Root>
  );
};
