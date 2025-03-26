import { useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { DocumentsUsecase } from '@domain/usecases/organization-details/documents.usecase';
import { CreateDocumentUsecase } from '@domain/usecases/organization-details/create-document.usecase';
import { UpdateDocumentUsecase } from '@domain/usecases/organization-details/update-document.usecase';
import { DeleteDocumentUsecase } from '@domain/usecases/organization-details/delete-document.usecase';

import { Icon } from '@ui/media/Icon';
import { Input } from '@ui/form/Input';
import { Button } from '@ui/form/Button/Button';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { ConfirmDialog } from '@ui/overlay/AlertDialog/ConfirmDialog';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
} from '@ui/overlay/Modal';

import { DocumentListItem } from './DocumentListItem';

export const Documents = observer(({ id }: { id: string }) => {
  const store = useStore();
  const [params, setParams] = useSearchParams();
  const [targetDocId, setTargetDocId] = useState<string | null>();

  const listUsecase = useMemo(
    () => new DocumentsUsecase(id, store.documents),
    [id],
  );
  const createUsecase = useMemo(
    () => new CreateDocumentUsecase(id, store.session, store.documents),
    [id, store.session, store.documents],
  );
  const updateUsecase = useMemo(
    () => new UpdateDocumentUsecase(store.documents),
    [store.documents],
  );
  const deleteUsecase = useMemo(
    () => new DeleteDocumentUsecase(store.documents)!,
    [id, store.documents],
  );

  const isActive = (id: string) =>
    params.has('doc') && params.get('doc') === id;

  const handleClick = (id: string) => {
    setTargetDocId(id);
    setParams((prev) => {
      if (prev.has(id)) {
        prev.delete('doc');
      } else {
        prev.set('doc', id);
      }

      return prev;
    });
  };

  useEffect(() => {
    listUsecase.init();
  }, [id]);

  useEffect(() => {
    if (!targetDocId) return;
    updateUsecase.init(targetDocId);
    deleteUsecase.init(targetDocId);
  }, [targetDocId]);

  return (
    <div className='w-full'>
      <div className='flex gap-2 items-center mb-2'>
        <h2 className='text-sm font-medium'>Reports & notes</h2>
        <IconButton
          size='xxs'
          variant='ghost'
          icon={<Icon name='plus' />}
          aria-label='create document'
          onClick={() =>
            createUsecase.execute({
              onSuccess: (docId) => {
                setParams((p) => {
                  p.set('doc', docId);

                  return p;
                });
              },
            })
          }
        />
      </div>
      <div className='flex flex-col gap-2 max-w-[32rem]'>
        {listUsecase.list.map((doc) => {
          return (
            <DocumentListItem
              id={doc.id}
              key={doc.id}
              onClick={handleClick}
              isActive={isActive(doc.id)}
              onRename={() => updateUsecase?.toggleRename(true)}
              onArchive={() => deleteUsecase?.toggleConfirmation(true)}
            />
          );
        })}
      </div>

      <Modal
        open={updateUsecase?.isRenameModalOpen}
        onOpenChange={(v) => updateUsecase?.toggleRename(v)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader className='font-medium'>Rename document</ModalHeader>
          <ModalBody>
            <Input
              size='xs'
              placeholder='Document name'
              value={updateUsecase?.renameValue}
              invalid={!!updateUsecase?.renameValidation}
              onChange={(e) => updateUsecase?.setRenameValue(e.target.value)}
            />
            {!!updateUsecase?.renameValidation && (
              <p>{updateUsecase?.renameValidation}</p>
            )}
          </ModalBody>
          <ModalFooter className='flex gap-3 justify-between'>
            <Button
              className='flex-1'
              onClick={() => updateUsecase?.toggleRename(false)}
            >
              Cancel
            </Button>
            <Button
              className='flex-1'
              colorScheme='primary'
              onClick={updateUsecase?.execute}
              isDisabled={!!updateUsecase?.renameValidation}
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        confirmButtonLabel='Archive'
        title='Archive this document?'
        onConfirm={() => deleteUsecase?.execute()}
        onClose={() => deleteUsecase?.toggleConfirmation(false)}
        isOpen={deleteUsecase?.isDeleteConfirmationOpen ?? false}
      ></ConfirmDialog>
    </div>
  );
});
