import { useMemo, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { DocumentDeleteUsecase } from '@domain/usecases/document/document-delete.usecase';

import { useStore } from '@shared/hooks/useStore';
import { ConfirmDialog } from '@ui/overlay/AlertDialog/ConfirmDialog';

interface DocumentDeleteDialogProps {
  docId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const DocumentDeleteDialog = observer(
  ({ docId, open, onOpenChange }: DocumentDeleteDialogProps) => {
    const store = useStore();

    const usecase = useMemo(
      () => new DocumentDeleteUsecase(store.documents),
      [store.documents],
    );

    useEffect(() => {
      usecase.init(docId);
    }, [docId]);

    return (
      <ConfirmDialog
        isOpen={open}
        confirmButtonLabel='Archive'
        title='Archive this document?'
        onClose={() => onOpenChange(false)}
        onConfirm={() => usecase?.execute()}
      ></ConfirmDialog>
    );
  },
);
