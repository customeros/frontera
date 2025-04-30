import { observer } from 'mobx-react-lite';
import { MeetingSchedulerUsecase } from '@domain/usecases/settings/meeting-scheduler/meeting-scheduler.usecase';

import { Icon } from '@ui/media/Icon';
import { Avatar } from '@ui/media/Avatar';
import { Menu } from '@ui/overlay/Menu/Menu';
import { Button } from '@ui/form/Button/Button';
import { MenuList } from '@ui/overlay/Menu/Menu';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { MenuItem, MenuButton } from '@ui/overlay/Menu/Menu';
import { InfoDialog } from '@ui/overlay/AlertDialog/InfoDialog';
import { ConfirmDeleteDialog } from '@ui/overlay/AlertDialog/ConfirmDeleteDialog';
interface AssignBookingsProps {
  usecase: MeetingSchedulerUsecase;
}

export const AssignBookings = observer(({ usecase }: AssignBookingsProps) => {
  const availableParticipants = usecase.participants.filter(
    (p) => !usecase.meetingConfig.participantEmails.includes(p.email),
  );

  return (
    <>
      <div className='flex flex-col gap-2 items-start w-full'>
        <div className='flex items-center gap-2 ml-[5px]'>
          <Icon name='user-left-01' className='text-grayModern-500' />
          <p className='font-medium'>Assign bookings to...</p>
        </div>
        {usecase.participants.length > 0 && (
          <div className='flex flex-col items-start justify-between gap-2 w-full'>
            {usecase.meetingConfig.participants.map((participant) => (
              <div
                key={participant.email}
                className='flex items-center gap-2 group justify-between w-full'
              >
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
        {availableParticipants.length > 0 && (
          <Menu>
            <MenuButton asChild>
              <Button
                size='xs'
                variant='ghost'
                colorScheme='primary'
                className='min-w-[28px] ml-[-5px]'
                leftIcon={<Icon name='plus-circle' />}
              >
                Add user
              </Button>
            </MenuButton>
            <MenuList side='bottom' align='center'>
              {availableParticipants.map((participant) => (
                <MenuItem
                  key={participant.email}
                  onClick={() => {
                    usecase.updateMeetingConfig({
                      participantEmails: [
                        ...usecase.meetingConfig.participantEmails,
                        participant.email,
                      ],
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
                      <Icon
                        name='user-03'
                        className='text-grayModern-700 size-6'
                      />
                    }
                  />
                  {participant.name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}
        {usecase.participants.filter(
          (p) => !usecase.meetingConfig.participantEmails.includes(p.email),
        ).length === 0 && (
          <Button
            size='xs'
            variant='ghost'
            colorScheme='primary'
            className='min-w-[28px] ml-[-5px]'
            leftIcon={<Icon name='plus-circle' />}
            onClick={() => {
              usecase.toggleNoUserModalConnected();
            }}
          >
            Add user
          </Button>
        )}
      </div>

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

      <InfoDialog
        confirmButtonLabel='Got it'
        label='Connect a calendar first'
        isOpen={usecase.noUserModalConnected}
        onClose={() => {
          usecase.toggleNoUserModalConnected();
        }}
        onConfirm={() => {
          usecase.toggleNoUserModalConnected();
        }}
        description='To add more people to this schedule ask one of your teammates to connect their calendar and set their availability. '
      />
    </>
  );
});
