import { useMemo, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { DocumentRenameUsecase } from '@domain/usecases/document/document-rename.usecase';

import { Input } from '@ui/form/Input';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
} from '@ui/overlay/Modal';

interface DocumentRenameModalProps {
  docId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const DocumentRenameModal = observer(
  ({ docId, onOpenChange, open }: DocumentRenameModalProps) => {
    const store = useStore();
    const doc = store.documents.getById(docId);
    const docName = doc?.value.name;
    const usecase = useMemo(
      () => new DocumentRenameUsecase(store.documents),
      [store.documents],
    );

    useEffect(() => {
      if (typeof docName !== 'undefined') {
        usecase.init(docId, docName);
      }
    }, [docId, docName]);

    return (
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader className='font-medium'>Rename document</ModalHeader>
          <ModalBody>
            <Input
              size='xs'
              placeholder='Document name'
              value={usecase?.renameValue}
              invalid={!!usecase?.renameValidation}
              onChange={(e) => usecase?.setRenameValue(e.target.value)}
            />
            {!!usecase?.renameValidation && <p>{usecase?.renameValidation}</p>}
          </ModalBody>
          <ModalFooter className='flex gap-3 justify-between'>
            <Button className='flex-1' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className='flex-1'
              colorScheme='primary'
              isDisabled={!!usecase?.renameValidation}
              onClick={() =>
                usecase?.execute({ onSuccess: () => onOpenChange(false) })
              }
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
);
