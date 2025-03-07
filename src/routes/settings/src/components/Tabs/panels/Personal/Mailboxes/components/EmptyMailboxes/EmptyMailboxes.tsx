import { Icon } from '@ui/media/Icon';
import { Logo } from '@ui/media/Logo';
import { Button } from '@ui/form/Button/Button';
import { Microsoft } from '@ui/media/icons/Microsoft';
import { FeaturedIcon } from '@ui/media/Icon/FeaturedIcon';
import HalfCirclePattern from '@shared/assets/HalfCirclePattern';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

interface EmptyMailboxesProps {
  onAzureSync: () => void;
  onGoogleSync: () => void;
  buyMailboxes: () => void;
}

export const EmptyMailboxes = ({
  onAzureSync,
  onGoogleSync,
  buyMailboxes,
}: EmptyMailboxesProps) => {
  return (
    <div className='overflow-y-auto h-full'>
      <div className='flex flex-col h-full w-full max-w-[500px] border-r-[1px]'>
        <div className='flex relative'>
          <FeaturedIcon
            size='lg'
            colorScheme='grayModern'
            className='absolute top-[26%] justify-self-center right-0 left-0'
          >
            <Icon name='inbox-01' />
          </FeaturedIcon>
          <HalfCirclePattern />
        </div>
        <div className='flex flex-col text-center items-center translate-y-[-235px]'>
          <h1 className='text-md font-semibold mb-1'>Add workspace accounts</h1>
          <p className='text-sm max-w-[352px] mb-6 '>
            Add your workspace accounts to sync contacts and send emails—or buy
            CustomerOS mailboxes to power your outbound messaging.
          </p>

          <Menu>
            <MenuButton asChild>
              <Button size='sm' colorScheme='primary'>
                Add an account
              </Button>
            </MenuButton>
            <MenuList side='bottom' align='center'>
              <MenuItem className='text-sm' onClick={onGoogleSync}>
                <Logo name='google' className='mr-1 size-5' />
                Google Workspace
              </MenuItem>
              <MenuItem className='text-sm' onClick={onAzureSync}>
                <Microsoft className='mr-2' />
                Microsoft Outlook
              </MenuItem>
            </MenuList>
          </Menu>

          <Button
            size='sm'
            variant='ghost'
            className='mt-3'
            onClick={buyMailboxes}
          >
            Buy CustomerOS mailboxes
          </Button>
        </div>
      </div>
    </div>
  );
};
