import { useRef } from 'react';
import { SelectInstance } from 'react-select';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Editor } from '@ui/form/Editor/Editor';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { Select, getContainerClassNames } from '@ui/form/Select/Select';

export const ThreadsView = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const emailId = searchParams.get('email');
  const myRef = useRef<SelectInstance>(null);

  const handleClick = () => {
    console.log('clicked in rasa matii');
    myRef.current?.focus();
  };

  // const threads = store.threads.toArray();

  return (
    <>
      {/* <div className='flex flex-col items-center w-full justify-between h-[calc(100vh-60px)] p-4'>
        <div className='flex flex-col gap-2'>
          {emailId === '1' && <div>Email 1</div>}
          {emailId === '2' && <div>Email 2</div>}
          {emailId === '3' && <div>Email 3</div>}
          {emailId === '4' && <div>Email 4</div>}
        </div>
      </div>
      <div className='border border-grayModern-200 rounded-md p-2 w-[50%]'>
        <Editor
          namespace='inbox'
          className='w-full'
          defaultHtmlValue={''}
          placeholder='Write a email...'
        />
      </div> */}
      <div className='w-[100%]' onClick={handleClick}>
        <div className='flex items-baseline mb-[-1px] mt-0 flex-1 overflow-visible'>
          <span className='text-grayModern-700 font-semibold mr-1 text-sm'>
            From:
          </span>
          <Select
            size='md'
            value={[]}
            ref={myRef}
            name='from'
            isSearchable
            onChange={() => {}}
            menuPlacement={'auto'}
            openMenuOnClick={true}
            placeholder={'CEA MAI MIZERIE COMPONENTA'}
            options={[
              { label: 'Email 1', value: '1' },
              { label: 'Email 2', value: '2' },
              { label: 'Email 3', value: '3' },
              { label: 'Email 4', value: '4' },
            ]}
            classNames={{
              container: () =>
                getContainerClassNames(
                  'focus-within:border-transparent focus-within:hover:border-transparent hover:border-transparent focus:border-transparent hover:focus:border-transparent focus-within:border-transparent',
                  'flushed',
                  {
                    size: 'md',
                  },
                ),
              input: () =>
                'hover:border-transparent focus:border-transparent hover:focus:border-transparent focus-within:border-transparent',
            }}
          />
        </div>
      </div>

      <div className='w-full mt-2' onClick={() => console.log('clicked')}>
        <Editor
          namespace='inbox'
          showToolbarBottom
          className='w-full'
          defaultHtmlValue={''}
          placeholder='Write a email...'
          onHashtagCreate={(hashtag) => {
            console.log('hashtag created', hashtag);
          }}
        >
          <Button>Send</Button>
        </Editor>
      </div>
    </>
  );
});
