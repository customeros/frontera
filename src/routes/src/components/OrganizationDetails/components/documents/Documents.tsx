import { useMemo, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { DocumentsUsecase } from '@domain/usecases/organization-details/documents.usecase';

import { useStore } from '@shared/hooks/useStore';

export const Documents = observer(({ id }: { id: string }) => {
  const store = useStore().documents;
  const usecase = useMemo(() => new DocumentsUsecase(id, store), [id]);

  useEffect(() => {
    usecase.init();
  }, [id]);

  return <div className='w-full bg-primary-200'></div>;
});
