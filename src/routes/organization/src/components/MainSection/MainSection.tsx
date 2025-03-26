import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { useStore } from '@shared/hooks/useStore';

import { DocumentEditor } from '../DocumentEditor';

export const MainSection = observer(
  ({ children }: { children?: React.ReactNode }) => {
    const store = useStore();
    const [params] = useSearchParams();

    const docId = params.get('doc');
    const displayDocEditor = docId && store.documents.value.has(docId);

    return (
      <div
        id='main-section'
        className='flex h-full flex-grow flex-shrink border-none rounded-none flex-col overflow-hidden shadow-none relative bg-white min-w-[609px] p-0'
      >
        {displayDocEditor ? (
          <DocumentEditor />
        ) : (
          <>
            <div className='px-6 pt-[6px] pb-2 flex items-center flex-row justify-between'>
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
