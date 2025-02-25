import { observer } from 'mobx-react-lite';
import { useFeatureIsOn } from '@growthbook/growthbook-react';

import { cn } from '@ui/utils/cn.ts';
import { Plus } from '@ui/media/icons/Plus';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';

export const ContactAvatarHeader = observer(() => {
  const store = useStore();
  const enableFeature = useFeatureIsOn('gp-dedicated-1');

  return (
    <div className='flex w-[26px] items-center justify-center'>
      <Tooltip
        asChild
        side='bottom'
        align='center'
        label='Create a contact'
        className={cn(enableFeature ? 'visible' : 'hidden')}
      >
        <IconButton
          size='xxs'
          variant='ghost'
          aria-label='create a contact'
          dataTest='create-contact-from-table'
          icon={<Plus className='text-gray-400 size-5' />}
          className={cn('size-6', enableFeature ? 'visible' : 'hidden')}
          onClick={() => {
            store.ui.commandMenu.setType('AddContactsBulk');
            store.ui.commandMenu.setOpen(true);
          }}
        />
      </Tooltip>
    </div>
  );
});
