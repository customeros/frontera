import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Editor } from '@ui/form/Editor/Editor';
import { Button } from '@ui/form/Button/Button';
import { Avatar } from '@ui/media/Avatar/Avatar';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

import { MailStub } from './components/MailStub/MailStub';
import { EmailRecipientsSection } from './components/EmailRecipientsSection/EmailRecipientsSection';

export const ThreadsView = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();

  const user = store.users.getById(store.session.value.profile.id);
  const avatarId = user?.profilePhotoUrl ?? '';
  const imgSrc = store.files.values.get(avatarId ?? '');
  const newEmail = searchParams.get('newEmail');

  return (
    <>
      <div className='flex flex-col items-center overflow-y-auto w-full justify-between h-[calc(100vh-40px)] p-4'>
        <div className='flex flex-col gap-2  w-[700px]'>
          {!newEmail && <MailStub />}
        </div>
        <div className='border border-grayModern-200 rounded-md p-3 w-[70%]'>
          <div className='w-[100%]'>
            <EmailRecipientsSection />
          </div>

          <div id='mariana' className='flex items-start gap-2'>
            <Avatar
              size='xs'
              src={imgSrc}
              textSize='xs'
              variant='outlineCircle'
              name={user?.name ?? ''}
              icon={<Icon name='user-03' />}
            />
            <div className='mt-[-12px] w-full'>
              <Editor
                size='sm'
                namespace='inbox'
                defaultHtmlValue={''}
                placeholder='Write a email...'
              >
                <div className='flex items-center gap-2 justify-between w-full'>
                  <IconButton
                    aria-label='test'
                    icon={<Icon name='activity-heart' />}
                  />
                  <Button className='self-end float-end'>Send</Button>
                </div>
              </Editor>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
