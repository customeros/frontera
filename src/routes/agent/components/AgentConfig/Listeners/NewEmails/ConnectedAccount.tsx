import { Link } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { NewEmailsUsecase } from '@domain/usecases/agents/listeners/new-emails.usecase';

import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { IconButton } from '@ui/form/IconButton';
import { useDisclosure } from '@ui/utils/hooks/useDisclosure';
import { ConfirmDialog } from '@ui/overlay/AlertDialog/ConfirmDialog';

export const ConnectedAccount = observer(
  ({ email, usecase }: { email: string; usecase: NewEmailsUsecase }) => {
    const { onOpen, onClose, open } = useDisclosure({ id: 'delete-field' });

    return (
      <div className='flex justify-between items-center group'>
        <div className='flex gap-2'>
          <Avatar
            src={''}
            size='xs'
            name={email}
            textSize='sm'
            variant={'outlineCircle'}
            className='w-5 h-5 min-h-5 min-w-5'
          />
          <p className='text-sm'>{email}</p>
        </div>
        <div className='flex items-center'>
          <IconButton
            size='xxs'
            variant='ghost'
            onClick={onOpen}
            colorScheme='grayModern'
            aria-label='Remove token'
            icon={<Icon name='x-circle' />}
            className='opacity-0 group-hover:opacity-100'
          />
        </div>
        <ConfirmDialog
          isOpen={open}
          onClose={onClose}
          title='Remove this account?'
          confirmButtonLabel='Remove from agent'
          onConfirm={() => {
            usecase.removeLink(email);

            return usecase.execute();
          }}
          body={
            <>
              <p className='text-sm'>
                Removing this account will only stop it from importing emails
                with this agent.{' '}
              </p>
              <br />
              <p className='text-sm'>
                You can fully revoke its access in your{' '}
                <Link to='/settings' className='underline'>
                  workspace settings
                </Link>
                .
              </p>
            </>
          }
        />
      </div>
    );
  },
);
