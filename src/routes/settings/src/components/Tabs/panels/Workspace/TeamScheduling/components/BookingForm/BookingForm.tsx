import { observer } from 'mobx-react-lite';
import { MeetingSchedulerUsecase } from '@domain/usecases/settings/meeting-scheduler/meeting-scheduler.usecase';

import { Icon } from '@ui/media/Icon';
import { Checkbox } from '@ui/form/Checkbox/Checkbox';

interface BookingFormProps {
  usecase: MeetingSchedulerUsecase;
}

export const BookingForm = observer(({ usecase }: BookingFormProps) => {
  return (
    <>
      <div className='flex items-center gap-2'>
        <Icon name='text-input' className='text-grayModern-500' />
        <p className='font-medium'>Booking form</p>
      </div>
      <div className='flex items-center gap-2 bg-grayModern-100 rounded-md w-full py-1 px-2'>
        <Checkbox disabled isChecked={true} />
        <p>Your name *</p>
      </div>
      <div className='flex items-center gap-2 bg-grayModern-100 rounded-md w-full py-1 px-2'>
        <Checkbox disabled isChecked={true} />
        <p>Email address *</p>
      </div>
      <div className='flex items-center gap-2 bg-grayModern-100 rounded-md w-full py-1 px-2 justify-between'>
        <div className='flex items-center gap-2'>
          <Checkbox
            isChecked={Boolean(usecase.meetingConfig.bookingFormPhoneEnabled)}
            onChange={(value) => {
              usecase.updateMeetingConfig({
                bookingFormPhoneEnabled: value ? true : false,
              });
            }}
          />
          <p>Phone number</p>
        </div>
        <p
          className='underline text-grayModern-500 text-sm cursor-pointer'
          onClick={() => {
            usecase.updateMeetingConfig({
              bookingFormPhoneRequired:
                !usecase.meetingConfig.bookingFormPhoneRequired,
            });
          }}
        >
          {usecase.meetingConfig.bookingFormPhoneRequired
            ? 'Required'
            : 'Not required'}
        </p>
      </div>
    </>
  );
});
