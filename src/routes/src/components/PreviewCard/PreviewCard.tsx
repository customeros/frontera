import { useLocalStorage } from 'usehooks-ts';

import { cn } from '@ui/utils/cn';

interface PreviewCardProps {
  className?: string;
  isInvoice?: boolean;
  children: React.ReactNode;
}

export const PreviewCard = ({
  children,
  isInvoice,
  className,
}: PreviewCardProps) => {
  const [previewCard] = useLocalStorage('previewCard', false);

  return (
    <div
      data-state={previewCard ? 'open' : 'closed'}
      className={cn(
        'data-[state=open]:animate-slideLeftAndFade data-[state=closed]:animate-slideRightAndFade flex flex-col border border-r-0 border-t-0 border-b-0 border-grayModern-200  max-w-[400px] min-w-[400px] overflow-y-auto h-[calc(100vh-42px)]',
        className,
        isInvoice && 'max-w-[600px] min-w-[600px]',
      )}
    >
      {children}
    </div>
  );
};
