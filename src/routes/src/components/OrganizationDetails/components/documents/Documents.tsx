import { useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { DocumentRenameModal } from '@domain/components';
import { DocumentCreateUsecase } from '@domain/usecases/document/document-create.usecase';
import { DocumentDeleteDialog } from '@domain/components/document/document-delete-dialog';
import { DocumentsListByOrganizationUsecase } from '@domain/usecases/document/documents-list-by-organization.usecase';

import { Icon } from '@ui/media/Icon';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

import { DocumentListItem } from './DocumentListItem';

export const Documents = observer(({ id }: { id: string }) => {
  const store = useStore();
  const [params, setParams] = useSearchParams();
  const [openRename, setOpenRename] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [targetDocId, setTargetDocId] = useState<string | null>();

  const listUsecase = useMemo(
    () => new DocumentsListByOrganizationUsecase(id, store.documents),
    [id],
  );
  const createUsecase = useMemo(
    () => new DocumentCreateUsecase(id, store.session, store.documents),
    [id, store.session, store.documents],
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
      <div className='flex flex-col gap-2 max-w-[28rem]'>
        {listUsecase.list.map((doc) => {
          return (
            <DocumentListItem
              id={doc.id}
              key={doc.id}
              onClick={handleClick}
              isActive={isActive(doc.id)}
              onOpenRename={() => setOpenRename(true)}
              onOpenArchive={() => setOpenDelete(true)}
            />
          );
        })}
      </div>
      {targetDocId && (
        <DocumentRenameModal
          open={openRename}
          docId={targetDocId}
          onOpenChange={setOpenRename}
        />
      )}

      {targetDocId && (
        <DocumentDeleteDialog
          open={openDelete}
          docId={targetDocId}
          onOpenChange={setOpenDelete}
        />
      )}
    </div>
  );
});
