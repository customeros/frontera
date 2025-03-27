import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { useStore } from '@shared/hooks/useStore';

import { DocumentEditor } from '../DocumentEditor';

export const MainSection = observer(
  ({ children }: { children?: React.ReactNode }) => {
    const store = useStore();
    const [params] = useSearchParams();
    const [hasMounted, setHasMounted] = useState(false);

    const docId = params.get('doc');
    const displayDocEditor = docId && store.documents.value.has(docId);

    const viewMode = params.get('viewMode');
    const sidebarVisible = !viewMode || viewMode === 'default';

    useEffect(() => {
      setHasMounted(true);
    }, []);

    return (
      <div
        id='main-section'
        className={cn(
          'flex h-full flex-col overflow-hidden relative bg-white p-0 transition-[width] duration-300 ease-in-out',
          sidebarVisible ? 'w-[calc(100%-30rem)]' : 'w-full',
          hasMounted && 'animate-slideLeftAndFade',
        )}
      >
        {displayDocEditor ? (
          <DocumentEditor />
        ) : (
          <>
            <div className='px-6 pt-[6px] pb-2 flex items-center flex-row justify-between animate-fadeIn'>
              <h1 className='font-semibold text-[16px] text-grayModern-700'>
                Timeline
              </h1>
            </div>
            <div className='p-0 flex flex-col flex-1'>{children}</div>
          </>
        )}
      </div>
    );
  },
);
