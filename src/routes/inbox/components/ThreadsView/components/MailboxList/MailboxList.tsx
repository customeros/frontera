import { observer } from 'mobx-react-lite';
import { MailboxListUsecase } from '@domain/usecases/inbox/mailbox-list.usecase';

import { Icon } from '@ui/media/Icon';
import { Menu } from '@ui/overlay/Menu/Menu';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

import { CreatebleEmailAdress } from '../CreatebleEmailAdress/CreatebleEmailAddress';
const usecase = new MailboxListUsecase();

export const MailboxList = observer(() => {
  const store = useStore();

  const mailboxList = store.mailboxes.toArray();

  return (
    <div className='flex items-start'>
      <div className='flex flex-col  mb-[-1px] mt-0 flex-1 overflow-visible'>
        <div className='flex flex-col'>
          {usecase.ccEnabled && (
            <div className='flex items-center'>
              <span className='text-grayModern-700 font-semibold text-sm mr-1'>
                CC:
              </span>
              <CreatebleEmailAdress
                options={[]}
                onChange={() => {}}
                onCreate={() => {}}
                placeholder='Add CC'
                setInputValue={() => {}}
                inputValue={'valoaremare'}
                value={[{ label: 'nic@acme.com', value: 'valoaremare' }]}
              />
            </div>
          )}
          {usecase.bccEnabled && (
            <div>
              <span className='text-grayModern-700 font-semibold text-sm mr-1'>
                BCC:
              </span>
            </div>
          )}
        </div>
        <div>
          <span className='font-semibold text-sm mr-2'>From:</span>
          <Menu>
            <MenuButton asChild>
              <Button
                size='xs'
                variant='ghost'
                className='ml-[-3px]'
                rightIcon={<Icon name='chevron-down' />}
              >
                {usecase.from}
              </Button>
            </MenuButton>
            <MenuList>
              {mailboxList.map((mailbox, index) => (
                <MenuItem
                  key={index}
                  onClick={() => usecase.selectMailbox(mailbox.value.mailbox)}
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
    </div>
  );
});
