import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { MailboxListUsecase } from '@domain/usecases/inbox/mailbox-list.usecase';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Menu } from '@ui/overlay/Menu/Menu';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

import { EmailAdressEditor } from '../EmailAdressEditor';

export const MailboxList = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();

  const threadId = searchParams.get('id');

  const mailboxList = store.mailboxes.toArray();

  const emails = store.emails;

  const usecase = useMemo(() => {
    if (!threadId) return null;

    return new MailboxListUsecase(threadId, emails!);
  }, [threadId, emails.getEmailsByThreadId(threadId!).length]);

  useEffect(() => {
    usecase?.init();
  }, [threadId, emails.getEmailsByThreadId(threadId!).length]);

  if (!usecase) return null;

  const emailsLength = emails.getEmailsByThreadId(threadId!).length;
  const toEmails = emails.getEmailsByThreadId(threadId!)?.[emailsLength - 1]
    ?.value.to;

  return (
    <div className='flex items-start'>
      <div className='flex flex-col flex-1 w-full '>
        <div className='flex items-start gap-[12px] w-full'>
          <p className='font-medium text-sm mt-[2px]'>To:</p>
          <EmailAdressEditor
            size='sm'
            namespace='to-emails'
            defaultHtmlValue={toEmails}
            placeholder='Add an email...'
            onEmailsChange={(emails) => {}}
            emailsOptions={usecase.toOptions}
          />
        </div>
        {usecase.ccEnabled && (
          <div className='flex items-start min-h-[24px] w-full'>
            <p className='text-grayModern-700 font-medium text-sm mr-[8px] mt-[2px]'>
              CC:
            </p>

            <EmailAdressEditor
              size='sm'
              namespace='cc-emails'
              placeholder='Add an email...'
              emailsOptions={usecase.ccOptions}
              onEmailsChange={(emails) => {
                // console.log(emails);
              }}
              onBlur={() => {
                if (usecase.ccEnabled) {
                  usecase.toggleCc();
                }
              }}
              defaultHtmlValue={
                emails.getEmailsByThreadId(threadId!)?.[emailsLength - 1]?.value
                  .cc ?? []
              }
            />
          </div>
        )}
        {usecase.bccEnabled && (
          <div className='flex items-start min-h-[24px] w-full'>
            <p className='text-grayModern-700 font-medium text-sm mr-[8px] mt-[2px] '>
              BCC:
            </p>

            <EmailAdressEditor
              size='sm'
              usePlainText
              namespace='bcc-emails'
              placeholder='Add an email...'
              onEmailsChange={(emails) => {}}
              emailsOptions={usecase.bccOptions}
              defaultHtmlValue={
                emails.getEmailsByThreadId(threadId!)?.[emailsLength - 1]?.value
                  .bcc ?? []
              }
            />
          </div>
        )}
        <div className='flex items-center mb-1'>
          <span className='font-medium text-sm mr-2'>From:</span>
          <Menu>
            <MenuButton asChild>
              <Button
                size='xs'
                variant='ghost'
                rightIcon={<Icon name='chevron-down' />}
                className={cn('ml-[-3px]', {
                  'text-grayModern-400 font-normal': !usecase?.from,
                })}
              >
                {usecase?.from || 'Select From'}
              </Button>
            </MenuButton>
            <MenuList>
              {mailboxList.map((mailbox, index) => (
                <MenuItem
                  key={index}
                  onClick={() => usecase?.selectMailbox(mailbox.value.mailbox)}
                >
                  {mailbox.value.mailbox}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </div>
      </div>
      <div className='flex mb-[-1px] items-center justify-center'>
        <Button
          size='xxs'
          variant='ghost'
          onClick={usecase.toggleCc}
          className={cn(usecase.ccEnabled && 'hidden', 'visible')}
        >
          CC
        </Button>
        <Button size='xxs' variant='ghost' onClick={usecase.toggleBcc}>
          BCC
        </Button>
      </div>
    </div>
  );
});

{
  /* <div className='flex items-start'>
<div className='flex flex-col mb-[-1px] mt-0 flex-1 overflow-visible'>
  <div className='flex items-start gap-[6px] min-h-[36px]'>
    <p className={cn('font-medium text-sm mt-2')}>To:</p>
    <EmailAdressEditor
      size='sm'
      placeholder='emails'
      namespace='to-emails'
      defaultHtmlValue={toEmails}
      onEmailsChange={(emails) => {}}
      emailsOptions={usecase.toOptions}
    />
  </div>
  <div className='flex flex-col'>
    {usecase.ccEnabled && (
      <div className='flex items-start min-h-[36px]'>
        <p className='text-grayModern-700 font-medium text-sm mr-[4px] mt-2'>
          CC:
        </p>

        <EmailAdressEditor
          size='sm'
          placeholder='emails'
          namespace='cc-emails'
          emailsOptions={usecase.ccOptions}
          onEmailsChange={(emails) => {
            console.log(emails);
          }}
          defaultHtmlValue={
            emails.getEmailsByThreadId(threadId!)?.[emailsLength - 1]
              ?.value.cc ?? []
          }
        />
      </div>
    )}
    {usecase.bccEnabled && (
      <div className='flex mb-1'>
        <span className='text-grayModern-700 font-medium text-sm mr-[4px] self-start'>
          BCC:
        </span>

        <EmailAdressEditor
          size='sm'
          namespace='bcc-emails'
          placeholder='de ce nu apare '
          onEmailsChange={(emails) => {}}
          emailsOptions={usecase.bccOptions}
          defaultHtmlValue={
            emails.getEmailsByThreadId(threadId!)?.[emailsLength - 1]
              ?.value.bcc ?? ['']
          }
        />
      </div>
    )}
  </div>
  <div className='flex items-center mb-1'>
    <span className='font-medium text-sm mr-2'>From:</span>
    <Menu>
      <MenuButton asChild>
        <Button
          size='xs'
          variant='ghost'
          rightIcon={<Icon name='chevron-down' />}
          className={cn('ml-[-3px]', {
            'text-grayModern-400 font-normal': !usecase?.from,
          })}
        >
          {usecase?.from || 'Select From'}
        </Button>
      </MenuButton>
      <MenuList>
        {mailboxList.map((mailbox, index) => (
          <MenuItem
            key={index}
            onClick={() =>
              usecase?.selectMailbox(mailbox.value.mailbox)
            }
          >
            {mailbox.value.mailbox}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  </div>
</div>
<div className='flex mb-[-1px] items-center justify-center'>
  <Button size='xxs' variant='ghost' onClick={usecase.toggleCc}>
    CC
  </Button>
  <Button size='xxs' variant='ghost' onClick={usecase.toggleBcc}>
    BCC
  </Button>
</div>
</div> */
}
