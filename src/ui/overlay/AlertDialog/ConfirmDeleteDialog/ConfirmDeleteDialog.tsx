import { useRef, ReactNode, MouseEventHandler } from 'react';

import { Spinner } from '@ui/feedback/Spinner/Spinner';
import { Button, ButtonProps } from '@ui/form/Button/Button';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPortal,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  AlertDialogConfirmButton,
  AlertDialogCloseIconButton,
} from '../AlertDialog';

interface ConfirmDeleteDialogProps {
  label: string;
  isOpen: boolean;
  dataTest?: string;
  isLoading?: boolean;
  onClose: () => void;
  body?: React.ReactNode;
  hideCloseButton?: boolean;
  confirmButtonLabel: string;
  cancelButtonLabel?: string;
  loadingButtonLabel?: string;
  description?: string | ReactNode;
  colorScheme?: ButtonProps['colorScheme'];
  onConfirm: MouseEventHandler<HTMLButtonElement>;
}

export const ConfirmDeleteDialog = ({
  body,
  label,
  isOpen,
  onClose,
  dataTest,
  isLoading,
  onConfirm,
  description,
  hideCloseButton,
  confirmButtonLabel,
  colorScheme = 'error',
  cancelButtonLabel = 'Cancel',
  loadingButtonLabel = 'Deleting',
}: ConfirmDeleteDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} className='z-[99999]'>
      <AlertDialogPortal>
        <AlertDialogOverlay>
          <AlertDialogContent className='rounded-xl'>
            <div className='flex items-start w-full justify-between'>
              <p className='font-semibold line-clamp-2'>{label}</p>
              {!hideCloseButton && <AlertDialogCloseIconButton />}
            </div>
            <AlertDialogHeader className='font-bold'>
              {description && (
                <div className='mt-1 text-sm text-grayModern-700 font-normal'>
                  {description}
                </div>
              )}
            </AlertDialogHeader>

            {body && <AlertDialogBody asChild>{body}</AlertDialogBody>}
            <AlertDialogFooter>
              <AlertDialogCloseButton>
                <Button
                  size='md'
                  ref={cancelRef}
                  variant='outline'
                  className='bg-white '
                  isDisabled={isLoading}
                  colorScheme={'grayModern'}
                >
                  {cancelButtonLabel}
                </Button>
              </AlertDialogCloseButton>
              <AlertDialogConfirmButton asChild>
                <Button
                  size='md'
                  variant='outline'
                  onClick={onConfirm}
                  className='w-full '
                  data-test={dataTest}
                  isLoading={isLoading}
                  loadingText={loadingButtonLabel}
                  colorScheme={colorScheme || 'error'}
                  rightSpinner={
                    <Spinner
                      size={'sm'}
                      label='deleting'
                      className='text-error-300 fill-error-700'
                    />
                  }
                >
                  {confirmButtonLabel}
                </Button>
              </AlertDialogConfirmButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
