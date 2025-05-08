import { useBlocker } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { meetingConfigStore } from '@domain/stores/settings.store';
import { MeetingSchedulerUsecase } from '@domain/usecases/settings/meeting-scheduler/meeting-scheduler.usecase';

import { Logo } from '@ui/media/Logo';
import { Icon } from '@ui/media/Icon/Icon';
import { Input } from '@ui/form/Input/Input';
import { Button } from '@ui/form/Button/Button';
import { Editor } from '@ui/form/Editor/Editor';
import { Divider } from '@ui/presentation/Divider';
import { InfoDialog } from '@ui/overlay/AlertDialog/InfoDialog';
import { ConfirmDialog } from '@ui/overlay/AlertDialog/ConfirmDialog';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

import {
  EmptyState,
  BookingForm,
  AssignBookings,
  AssignmentMethod,
  AvailabilityLimits,
} from './components';

export const usePageLeaveBlocker = (
  when: boolean,
  usecase: MeetingSchedulerUsecase,
) => {
  const blocker = useBlocker(when);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (blocker?.state === 'blocked') {
      setShowModal(true);
    }
  }, [blocker?.state]);

  const handleNavigation = (shouldSave: boolean) => {
    if (blocker?.proceed === undefined) return;

    setShowModal(false);

    if (shouldSave) {
      usecase.execute();
    } else {
      usecase.discardChanges();
    }
    blocker.proceed();
  };

  return {
    showModal,
    confirmNavigation: () => handleNavigation(true),
    cancelNavigation: () => handleNavigation(false),
  };
};

const icons = {
  Other: <Icon name='marker-pin-01' className='text-grayModern-500' />,
  'Phone call': <Icon name='phone' className='text-grayModern-500' />,
  'Google Meet': <Logo name='google' className='ml-auto' />,
};

export const TeamScheduling = observer(() => {
  const usecase = useMemo(
    () => new MeetingSchedulerUsecase(meetingConfigStore),
    [],
  );

  useEffect(() => {
    usecase.init();
  }, []);

  const { showModal, confirmNavigation, cancelNavigation } =
    usePageLeaveBlocker(usecase.isDirty, usecase);

  if (!meetingConfigStore.id) {
    return (
      <div className='flex flex-col h-full w-full max-w-[448px] border-r border-grayModern-200'>
        <EmptyState usecase={usecase} />
      </div>
    );
  }

  return (
    <>
      <div className='px-6 pb-4  max-w-[500px] border-r border-grayModern-200 h-full overflow-y-auto text-sm'>
        <div className='flex flex-col'>
          <div className='flex items-center justify-between sticky top-0 pt-1 bg-white z-10'>
            <p className='text-grayModern-700 font-semibold text-base'>
              Booking event
            </p>
            <Button
              size='xs'
              colorScheme='primary'
              isDisabled={!usecase.isDirty}
              onClick={() => {
                usecase.execute();
              }}
            >
              Publish
            </Button>
          </div>
          <p className='mb-4'>
            Manage and share your team’s availability, so others can book time
            with the right person.
          </p>
          <div className='flex items-center gap-2'>
            <Icon name='layout-alt-03' className='text-grayModern-500' />
            <span className='font-medium'>Event details</span>
          </div>
          <div className='flex flex-col gap-1 mt-3'>
            <label htmlFor='title' className='font-medium'>
              Booking title <span className='font-normal'>*</span>
            </label>
            <Input
              size='sm'
              variant='outline'
              value={usecase.meetingConfig.title}
              onBlur={() => {
                usecase.updateToDefaultTitle();
              }}
              onChange={(e) => {
                usecase.updateMeetingConfig({
                  title: e.target.value,
                });
              }}
            />
            <p className='text-[12px] text-grayModern-500 px-2'>
              The calendar title will include the scheduler, assignee, and their
              company
            </p>
          </div>
          <div className='flex items-start gap-1 flex-col mt-4'>
            <label htmlFor='duration' className='font-medium'>
              Duration <span className='font-normal'>*</span>
            </label>
            <div className='flex items-center gap-2'>
              <Menu>
                <MenuButton asChild>
                  <Button size='xs' variant='outline' className='min-w-[28px]'>
                    {usecase.meetingConfig.durationMins}
                  </Button>
                </MenuButton>
                <MenuList side='bottom' align='center'>
                  {usecase.duration.map((option, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        usecase.updateMeetingConfig({
                          durationMins: parseInt(option.value),
                        });
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <span className='text-grayModern-500'>minutes</span>
            </div>
          </div>
          <div className='flex items-start gap-1 flex-col mt-4'>
            <label htmlFor='description' className='font-medium'>
              Description
            </label>
            <div className='border border-grayModern-200 rounded-md w-full p-2 pt-0'>
              <Editor
                size='sm'
                namespace='description'
                defaultHtmlValue={usecase.meetingConfig.description}
                onBlur={({ target }) => {
                  usecase.updateMeetingConfig({
                    description: target.outerHTML,
                  });
                }}
              />
            </div>
          </div>
          <div className='flex items-start gap-1 flex-col mt-4'>
            <label htmlFor='location' className='font-medium'>
              Location
            </label>
            <Menu>
              <MenuButton asChild>
                <Button
                  size='xs'
                  variant='outline'
                  rightIcon={<Icon name='chevron-down' />}
                  className='min-w-[130px] justify-between'
                  leftIcon={
                    icons[usecase.meetingConfig.location as keyof typeof icons]
                  }
                >
                  {usecase.meetingConfig.location}
                </Button>
              </MenuButton>
              <MenuList side='bottom' align='center' className='min-w-[134px]'>
                <MenuItem
                  onClick={() => {
                    usecase.updateMeetingConfig({
                      location: 'Other',
                    });
                  }}
                >
                  Other
                  {usecase.meetingConfig.location === 'Other' && (
                    <Icon name='check' className='ml-auto' />
                  )}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    usecase.updateMeetingConfig({
                      location: 'Phone call',
                    });
                  }}
                >
                  Phone call
                  {usecase.meetingConfig.location === 'Phone call' && (
                    <Icon name='check' className='ml-auto' />
                  )}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    usecase.updateMeetingConfig({
                      location: 'Google Meet',
                    });
                  }}
                >
                  Google Meet
                  {usecase.meetingConfig.location === 'Google Meet' && (
                    <Icon name='check' className='ml-auto' />
                  )}
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
          {/* <div className='flex items-start gap-1 flex-col mt-4'>
            <div className='flex items-center gap-2 justify-between w-full'>
              <label htmlFor='Logo' className='font-medium'>
                Logo
              </label>
              <Switch
                checked={usecase.meetingConfig.showLogo}
                onChange={(value) => {
                  usecase.updateMeetingConfig({ showLogo: value });
                }}
              />
            </div>
            <p>
              Show your{' '}
              <span
                className='underline cursor-pointer'
                onClick={() => navigate('/settings?tab=general')}
              >
                workspace logo
              </span>{' '}
              on the bookings page and notification emails
            </p>
          </div> */}
          {/* <div className='flex items-start gap-1 flex-col mt-4'>
            <label htmlFor='redirect-link' className='font-medium'>
              Redirect link
            </label>
            <Input
              size='sm'
              variant='outline'
              id='redirect-link'
              placeholder='Your home page or other link'
              value={usecase.meetingConfig.bookingConfirmationRedirectLink}
              onChange={(e) => {
                usecase.updateMeetingConfig({
                  bookingConfirmationRedirectLink: e.target.value,
                });
              }}
            />
          </div> */}
          <Divider className='my-4' />
          <div className='flex items-start flex-col justify-start w-full'>
            <AssignBookings usecase={usecase} />
          </div>
          <Divider className='my-4' />
          <div className='flex items-start gap-2 flex-col'>
            <AssignmentMethod usecase={usecase} />
          </div>
          <Divider className='my-4' />
          <div className='flex items-start gap-2 flex-col'>
            <BookingForm usecase={usecase} />
          </div>
          <Divider className='my-4' />
          <div className='flex items-start gap-2 flex-col'>
            <AvailabilityLimits usecase={usecase} />
          </div>
        </div>
        {/* <Divider className='my-4' />
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2 justify-between'>
            <div className='flex items-center gap-2'>
              <Icon name='bell-04' className='text-grayModern-500' />
              <p>Email notifications</p>
            </div>
            <Switch
              checked={usecase.meetingConfig.emailNotificationEnabled}
              onChange={(value) => {
                usecase.updateMeetingConfig({
                  emailNotificationEnabled: value,
                });
              }}
            />
          </div>
          <p>
            Send booking confirmations instantly and reminder emails to everyone
            15 minutes before the meeting
          </p>
        </div> */}
      </div>

      <InfoDialog
        label='Assignment methods'
        confirmButtonLabel='Got it'
        isOpen={usecase.infoDialogOpen}
        onClose={() => {
          usecase.toggleInfoDialog();
        }}
        onConfirm={() => {
          usecase.toggleInfoDialog();
        }}
        body={
          <div className='flex flex-col'>
            <p className='font-medium'>
              Round-robin • Maximize for availability
            </p>
            <p>
              Always choose the person who's available soonest—best when
              scheduling speed matters more than even distribution.
            </p>
            <p className='font-medium mt-4'>Custom logic</p>
            <p>
              Create your own assignment rules using Lua scripts—perfect if you
              want to define your own priorities, weights, or fallback behaviour
              beyond fairness or availability.
            </p>
          </div>
        }
      />
      {showModal && (
        <ConfirmDialog
          isOpen={showModal}
          confirmButtonLabel='Save changes'
          cancelButtonLabel='Discard changes'
          title='Want to save your changes first?'
          onClose={() => {
            cancelNavigation();
          }}
          onConfirm={() => {
            confirmNavigation();
          }}
          description='Your booking event has unsaved changes. Would you like to save them first before heading out?'
        />
      )}
    </>
  );
});
