import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { DocumentsUsecase } from '@domain/usecases/organization-details/documents.usecase';

import { cn } from '@ui/utils/cn';
import { Icon, IconName } from '@ui/media/Icon';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

export const Documents = observer(({ id }: { id: string }) => {
  const store = useStore().documents;
  const [params, setParams] = useSearchParams();
  const usecase = useMemo(() => new DocumentsUsecase(id, store), [id]);

  const isActive = (id: string) =>
    params.has('doc') && params.get('doc') === id;

  const handleClick = (id: string) => {
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
    usecase.init();
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
        />
      </div>
      <div className='flex flex-col gap-2 max-w-[32rem]'>
        {store.toArray().map((doc) => {
          return (
            <div
              key={doc.value.id}
              onClick={() => handleClick(doc.value.id)}
              className={cn(
                'flex relative gap-3 items-center py-1 px-2 cursor-pointer transition-colors hover:bg-grayModern-100 rounded',
                isActive(doc.value.id) && 'bg-grayModern-100',
              )}
            >
              <Icon name={doc.value.icon as IconName} />
              <p className='text-sm truncate'>{doc.value.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
});
