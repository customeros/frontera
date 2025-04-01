import { useMemo } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { EmailRecipientsSectionUsecase } from '@domain/usecases/inbox/email-recipients.usecase';

import { Icon } from '@ui/media/Icon';
import { Editor } from '@ui/form/Editor/Editor';
import { Button } from '@ui/form/Button/Button';
import { Avatar } from '@ui/media/Avatar/Avatar';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Divider } from '@ui/presentation/Divider';

import { MailStub } from './components/MailStub/MailStub';
import { EmailRecipientsSection } from './components/EmailRecipientsSection/EmailRecipientsSection';

export const ThreadsView = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();

  const user = store.users.getById(store.session.value.profile.id);
  const avatarId = user?.profilePhotoUrl ?? '';
  const imgSrc = store.files.values.get(avatarId ?? '');
  const newEmail = searchParams.get('newEmail');
  const threadId = searchParams.get('id');

  const usecase = useMemo(
    () => new EmailRecipientsSectionUsecase(threadId, store.emails),
    [threadId, newEmail, store.emails.toArray().length],
  );

  useEffect(() => {
    usecase.init();
  }, [threadId, newEmail, store.emails.toArray().length]);

  return (
    <>
      <div className='flex flex-col items-center overflow-y-auto w-full justify-end h-[calc(100vh-40px)] '>
        <div className='flex flex-col gap-2  w-full p-4'>
          {!newEmail && <MailStub />}
        </div>
        <div className='flex w-full items-end gap-4'>
          <div className=' w-[100%]'>
            <Divider className='my-4' />
            <div className='w-[100%] px-4'>
              <EmailRecipientsSection usecase={usecase} />
            </div>

            <div className='flex items-start gap-2 px-4 pb-6'>
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
                  onChange={(value) => {
                    usecase.setBody(value);
                  }}
                >
                  <div className='flex items-center gap-2 justify-between w-full'>
                    <IconButton
                      size='xs'
                      aria-label='test'
                      icon={<Icon name='activity-heart' />}
                    />
                    <Button
                      size='xs'
                      onClick={() => {
                        usecase.sendEmail({
                          input: {
                            attachmentIds: [],
                            fromName: 'Jonty',
                            mailboxId: 'mbox_8vra5tr1ax2lwuer',
                            subject: 'test',
                            body: {
                              html: '<p>test</p>',
                            },
                            fromAddress: 'jonty@purethephantom.com',
                            toAddresses: usecase.toValue,
                          },
                        });
                      }}
                    >
                      Send
                    </Button>
                  </div>
                </Editor>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
