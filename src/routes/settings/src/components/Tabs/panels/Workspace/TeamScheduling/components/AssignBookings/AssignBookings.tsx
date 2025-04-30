import { observer } from 'mobx-react-lite';
import { MeetingSchedulerUsecase } from '@domain/usecases/settings/meeting-scheduler/meeting-scheduler.usecase';

import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { Menu } from '@ui/overlay/Menu/Menu';
import { Button } from '@ui/form/Button/Button';
import { MenuList } from '@ui/overlay/Menu/Menu';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { MenuItem, MenuButton } from '@ui/overlay/Menu/Menu';
import { ConfirmDeleteDialog } from '@ui/overlay/AlertDialog/ConfirmDeleteDialog';
interface AssignBookingsProps {
  usecase: MeetingSchedulerUsecase;
}

export const AssignBookings = observer(({ usecase }: AssignBookingsProps) => {
  return (
    <>
      <div className='flex items-center gap-2'>
        <Icon name='user-left-01' className='text-grayModern-500' />
        <p className='font-medium'>Assign bookings to...</p>
      </div>
      {usecase.participants.length > 0 && (
        <div className='flex flex-col items-start gap-2 w-full'>
          {usecase.meetingConfig.participants.map((participant) => (
            <div className='flex items-center gap-2 group justify-between w-full'>
              <div className='flex items-center gap-2'>
                <Avatar
                  size='xs'
                  textSize='sm'
                  variant='outlineCircle'
                  name={participant.name}
                  src={participant.profilePhotoUrl}
                  icon={
                    <Icon
                      name='user-03'
                      className='text-grayModern-700 size-6'
                    />
                  }
                />
                <div>
                  <span>{participant.name}</span>{' '}
                  <span className='text-grayModern-500'>
                    • {participant.email}
                  </span>
                </div>
              </div>
              <IconButton
                size='xxs'
                variant='ghost'
                icon={<Icon name='x-close' />}
                aria-label='remove-participant'
                className='group-hover:opacity-100 opacity-0'
                onClick={() => {
                  if (usecase.meetingConfig.participants.length === 1) {
                    usecase.toggleConfirmDialogRemoveLastUser();
                  } else {
                    usecase.updateMeetingConfig({
                      participantEmails:
                        usecase.meetingConfig.participantEmails.filter(
                          (email) => email !== participant.email,
                        ),
                      participants: usecase.meetingConfig.participants.filter(
                        (p) => p.email !== participant.email,
                      ),
                    });
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
      <Menu>
        <MenuButton asChild>
          <Button
            size='xs'
            variant='ghost'
            colorScheme='primary'
            className='min-w-[28px]'
            leftIcon={<Icon name='plus-circle' />}
          >
            Add user
          </Button>
        </MenuButton>
        <MenuList side='bottom' align='center'>
          {usecase.participants.map((participant) => (
            <MenuItem
              key={participant.email}
              onClick={() => {
                usecase.updateMeetingConfig({
                  participantEmails: [participant.email],
                  participants: [
                    ...usecase.meetingConfig.participants,
                    participant,
                  ],
                });
              }}
            >
              <Avatar
                size='xs'
                textSize='sm'
                variant='outlineCircle'
                name={participant.name}
                src={participant.profilePhotoUrl}
                icon={
                  <Icon name='user-03' className='text-grayModern-700 size-6' />
                }
              />
              {participant.name}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <ConfirmDeleteDialog
        confirmButtonLabel='Remove'
        label='Remove last available user? '
        isOpen={usecase.confirmDialogRemoveLastUser}
        onClose={() => {
          usecase.toggleConfirmDialogRemoveLastUser();
        }}
        description='Removing this user means no one will be available to book time with your team anymore. '
        onConfirm={() => {
          usecase.updateMeetingConfig({
            participantEmails: [],
            participants: [],
          });
        }}
      />
    </>
  );
});
