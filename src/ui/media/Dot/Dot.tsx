import { cn } from '@ui/utils/cn';

interface DotProps {
  className?: string;
  colorScheme?: string;
}

export const Dot = ({ colorScheme, className, ...props }: DotProps) => {
  const colors = (colorScheme: string) => {
    switch (colorScheme) {
      case 'orangeDark':
        return 'bg-orangeDark-700';
      case 'greenLight':
        return 'bg-greenLight-400';
      case 'yellow':
        return 'bg-yellow-500';
      case 'grayModern':
        return 'bg-grayModern-500';
      case 'error':
        return 'bg-error-500';
      case 'success':
        return 'bg-success-500';
      case 'warning':
        return 'bg-warning-500';
      default:
        return 'text-grayModern-500';
    }
  };

  return (
    <div
      className={cn(
        colors(colorScheme || 'grayModern'),
        'size-[10px] rounded-full',
        className,
      )}
      {...props}
    />
  );
};
