import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Editor } from '@ui/form/Editor/Editor';
import { Button } from '@ui/form/Button/Button';
import { Avatar } from '@ui/media/Avatar/Avatar';
import { useStore } from '@shared/hooks/useStore';

import { MailboxList } from './components/MailboxList/MailboxList';

export const ThreadsView = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const emailId = searchParams.get('email');

  // const threads = store.threads.toArray();

  const user = store.users.getById(store.session.value.profile.id);
  const avatarId = user?.profilePhotoUrl ?? '';
  const imgSrc = store.files.values.get(avatarId ?? '');

  return (
    <>
      <div className='flex flex-col items-center w-full justify-between h-[calc(100vh-40px)] p-4'>
        <div className='flex flex-col gap-2'>
          {emailId === '1' && <div>Email 1</div>}
          {emailId === '2' && <div>Email 2</div>}
          {emailId === '3' && <div>Email 3</div>}
          {emailId === '4' && <div>Email 4</div>}
        </div>
        <div className='border border-grayModern-200 rounded-md p-2  w-[70%]'>
          <div className='w-[100%]'>
            <MailboxList />
          </div>

          <div className='flex items-start gap-2 '>
            <Avatar
              size='xs'
              src={imgSrc}
              textSize='sm'
              className='mr-5'
              variant='outlineCircle'
              name={user?.name ?? ''}
              icon={<Icon name='user-03' />}
            />
            <div className='mt-[-12px] w-full'>
              <Editor
                namespace='inbox'
                defaultHtmlValue={''}
                placeholder='Write a email...'
              >
                <Button className='self-end float-end'>Send</Button>
              </Editor>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
