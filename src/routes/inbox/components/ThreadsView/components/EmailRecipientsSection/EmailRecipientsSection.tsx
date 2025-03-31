import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { EmailRecipientsSectionUsecase } from '@domain/usecases/inbox/email-recipients.usecase';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Menu } from '@ui/overlay/Menu/Menu';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

import { EmailAdressEditor } from '../EmailAdressEditor';

interface EmailRecipientsSectionProps {
  usecase: EmailRecipientsSectionUsecase;
}

export const EmailRecipientsSection = observer(
  ({ usecase }: EmailRecipientsSectionProps) => {
    const store = useStore();

    const mailboxList = store.mailboxes.toArray();

    return (
      <div className='flex items-start'>
        <div className='flex flex-col flex-1 w-full '>
          <div className='flex items-start gap-[12px] w-full'>
            <p className='font-medium text-sm mt-[2px]'>To:</p>
            <EmailAdressEditor
              size='sm'
              namespace='to-emails'
              placeholder='Add an email...'
              emailsOptions={usecase.toOptions}
              defaultHtmlValue={toJS(usecase.toValue)}
              onEmailsChange={(emails) => {
                usecase.setToValue(emails);
              }}
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
                defaultHtmlValue={toJS(usecase.ccValue)}
                onEmailsChange={(emails) => {
                  usecase.setCcValue(emails);
                }}
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
                emailsOptions={usecase.bccOptions}
                defaultHtmlValue={toJS(usecase.bccValue)}
                onEmailsChange={(emails) => {
                  usecase.setBccValue(emails);
                }}
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
  },
);
