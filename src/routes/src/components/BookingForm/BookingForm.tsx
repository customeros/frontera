import { useState, useEffect } from 'react';

import { Logo } from '@/ui/media/Logo';
import { format } from 'date-fns/format';
import { Avatar } from '@/ui/media/Avatar';
import { Combobox } from '@/ui/form/Combobox';
import { SelectOption } from '@/ui/utils/types';
import { Button } from '@/ui/form/Button/Button';
import { Icon, FeaturedIcon } from '@/ui/media/Icon';
import { DatePicker } from '@/ui/form/DatePicker/DatePicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/overlay/Popover';

import { cn } from '@ui/utils/cn';
import { Input } from '@ui/form/Input';
import {
  CalendarAvailabilityResponse,
  CalendarAvailabilityDetailsResponse,
} from '@graphql/types';

export type BookingInput = {
  name: string;
  email: string;
  phone?: string;
  startTime: string;
  isCanceling?: boolean;
  isRescheduling?: boolean;
};

export type BookingResponse = {
  endTime: string;
  hostName: string;
  startTime: string;
  hostEmail: string;
  status: 'already_exists' | 'created' | 'rescheduled' | 'cancelled';
};

interface BookingFormProps
  extends Omit<CalendarAvailabilityResponse, '__typename'>,
    Omit<CalendarAvailabilityDetailsResponse, '__typename'> {
  timezone: SelectOption;
  timezones: SelectOption[];
  isDetailsLoading?: boolean;
  isTimezonesLoading?: boolean;
  isAvailabilityLoading?: boolean;
  isBookingConfirmationLoading?: boolean;
  onCancel: (payload: BookingInput) => void;
  bookingConfirmation: BookingResponse | null;
  onReschedule: (payload: BookingInput) => void;
  onMakeBooking: (payload: BookingInput) => void;
  onActiveStartDate: (date: Date | null) => void;
  onTimezoneChange: (timezone: SelectOption) => void;
}

export const BookingForm = ({
  days,
  timezone,
  location,
  timezones,
  tenantName,
  bookingTitle,
  durationMins,
  tenantLogoUrl,
  onCancel,
  onReschedule,
  onMakeBooking,
  onTimezoneChange,
  onActiveStartDate,
  isDetailsLoading,
  isTimezonesLoading,
  bookingConfirmation,
  isAvailabilityLoading,
  bookingFormNameEnabled,
  bookingFormEmailEnabled,
  bookingFormPhoneEnabled,
  bookingFormPhoneRequired,
  isBookingConfirmationLoading,
}: BookingFormProps) => {
  const [step, setStep] = useState(0);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [areTimezonesOpen, setOpenTimezones] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [participantDetails, setParticipantsDetails] = useState<Pick<
    BookingInput,
    'name' | 'email'
  > | null>(null);

  const selectedDaySlot = days.find(
    (d) => new Date(d.date).getDate() === selectedDay,
  );
  const selectedDayStr = selectedDaySlot
    ? format(new Date(selectedDaySlot?.date), 'iiii, do MMMM')
    : '';
  const selectedTimeRange = (() => {
    if (!selectedTimeSlot) return ['', ''];
    const timeslot = selectedDaySlot?.timeSlots.find(
      (s) => s.startTime === selectedTimeSlot,
    );

    return [
      format(new Date(timeslot?.startTime), 'k:mm'),
      format(new Date(timeslot?.endTime), 'k:mm'),
    ];
  })();

  useEffect(() => {
    const foundIndex = days.findIndex(
      (d) => new Date(d.date).getDate() === selectedDay,
    );

    if (foundIndex < 0) {
      setSelectedDay(null);
    }
  }, [timezone]);

  useEffect(() => {
    if (bookingConfirmation) {
      setStep(3);
    }
  }, [bookingConfirmation]);

  return (
    <div className='flex flex-col items-center w-full justify-center pt-8 sm:pt-[15%] animate-fadeIn overflow-y-auto'>
      <div
        className={cn(
          'grid border border-r-grayModern-200 rounded-xl shadow-xs bg-white transition-all duration-500 overflow-hidden',
          step === 0 &&
            'grid-cols-1 grid-rows-[260px_1fr] md:grid-cols-2 md:grid-rows-1',
          step === 1 &&
            'grid-cols-1 grid-rows-[260px_1fr_1fr] sm:grid-cols-1 sm:grid-rows-[260px_1fr] md:grid-cols-3 md:grid-rows-1',
          step === 2 &&
            'grid-cols-1 grid-rows-[260px_1fr] sm:grid-rows-[260px_1fr] sm:grid-cols-2 md:grid-rows-1 md:grid-cols-2',
          step === 3 && '',
        )}
      >
        <div
          className={cn(
            'h-full col-span-3 row-span-1 row-start-1 flex flex-col gap-3 transition-all duration-300 overflow-hidden',
            step === 1 && 'col-start-1',
            step === 2 && 'col-start-3 sm:col-start-5 md:col-start-1',
            step < 3
              ? 'min-w-[225px] w-[225px] py-7 px-4 opacity-100 scale-100'
              : 'min-w-0 w-0 opacity-0 scale-95',
          )}
        >
          <div className='flex gap-3 items-center animate-fadeIn'>
            {!isDetailsLoading ? (
              <Avatar
                size='xs'
                name={tenantName}
                src={tenantLogoUrl}
                variant='outlineSquare'
                className='animate-fadeIn'
              />
            ) : (
              <div className='size-6 min-w-6 rounded-sm animate-pulse bg-grayModern-300' />
            )}

            {!isDetailsLoading ? (
              <h1 className='text-sm font-medium animate-fadeIn text-nowrap'>
                {tenantName}
              </h1>
            ) : (
              <div className='h-6 w-full rounded-sm bg-grayModern-300 animate-pulse' />
            )}
          </div>

          <div className='animate-fadeIn'>
            {!isDetailsLoading ? (
              <p className='text-sm font-medium animate-fadeIn text-nowrap'>
                {bookingTitle}
              </p>
            ) : (
              <div className='h-5 w-full rounded-sm bg-grayModern-300 animate-pulse' />
            )}
          </div>

          {selectedTimeSlot && (
            <div className='flex items-start gap-2'>
              <Icon name='calendar' className='text-grayModern-500 mt-[2px]' />
              <div className='flex flex-col text-sm text-nowrap'>
                <p>{selectedDayStr}</p>
                <p>{selectedTimeRange.join(' - ')}</p>
              </div>
            </div>
          )}

          <div className='flex items-center gap-2 animate-fadeIn'>
            <Icon name='clock' className='text-grayModern-500' />
            {!isDetailsLoading ? (
              <span className='text-sm animate-fadeIn text-nowrap'>
                {durationMins} min
              </span>
            ) : (
              <div className='h-5 w-10 rounded-sm bg-grayModern-300 animate-pulse' />
            )}
          </div>

          <div className='flex items-center gap-2'>
            {!isDetailsLoading ? (
              <>{locationIconMap[location]}</>
            ) : (
              <div className='size-5 max-w-5 rounded-sm bg-grayModern-300 animate-pulse' />
            )}
            {!isDetailsLoading ? (
              <span className='text-sm animate-fadeIn text-nowrap'>
                {location}
              </span>
            ) : (
              <div className='h-5 w-24 rounded-sm bg-grayModern-300 animate-pulse' />
            )}
          </div>

          <Popover open={areTimezonesOpen} onOpenChange={setOpenTimezones}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  'flex items-center gap-2 cursor-pointer text-grayModern-700 transition-colors animate-fadeIn',
                  !areTimezonesOpen
                    ? 'hover:text-grayModern-900'
                    : 'text-grayModern-900',
                )}
              >
                <Icon name='globe-02' className='text-grayModern-500' />
                {!isTimezonesLoading ? (
                  <>
                    <span className='text-sm animate-fadeIn text-nowrap'>
                      {timezone.label || 'Your current timezone'}
                    </span>
                    <Icon
                      name='chevron-down'
                      className='animate-fadeIn text-grayModern-500'
                    />
                  </>
                ) : (
                  <div className='h-5 w-36 rounded-sm bg-grayModern-300 animate-pulse' />
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className='min-w-[200px]'>
              <Combobox
                value={timezone}
                options={timezones}
                onChange={(value) => {
                  onTimezoneChange(value);
                  setOpenTimezones(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <>
          <div
            className={cn(
              'h-[352px] transition-all duration-300 overflow-hidden col-span-2 row-start-2 md:row-start-1 border-t sm:border-t sm:border-r-0 md:border-t-0 md:border-l md:border-r-0 border-grayModern-200',
              step === 1 && 'md:border-r',
              step === 0 && 'sm:row-start-0 md:rounded-tr-xl rounded-br-xl',
              step > 2 && 'row-start-1',
              step === 2 && 'row-start-1 sm:row-start-2 sm:h-0',
              step < 2
                ? 'w-[350px] opacity-100 scale-100'
                : 'w-0 opacity-0 scale-95 border-none pointer-events-none',
            )}
          >
            <DatePicker
              view='month'
              minDetail='month'
              minDate={new Date()}
              className='min-w-[352px]'
              onClickDay={(v) => {
                setStep(1);
                setSelectedDay((v as unknown as Date).getDate());
              }}
              onActiveStartDateChange={({ activeStartDate }) => {
                onActiveStartDate(activeStartDate);
                setSelectedDay(null);
                setStep(0);
              }}
              tileDisabled={({ date }) => {
                const foundIndex = days.findIndex(
                  (d) => new Date(d.date).getDate() === date.getDate(),
                );

                return foundIndex < 0;
              }}
              tileClassName={({ date }) => {
                if (isAvailabilityLoading) return 'loading';

                const foundIndex = days.findIndex(
                  (d) => new Date(d.date).getDate() === date.getDate(),
                );

                if (foundIndex > -1) {
                  return 'available';
                }
              }}
            />
          </div>

          <div
            className={cn(
              'pb-7 flex flex-col col-span-3 row-start-3 sm:row-start-2 md:row-start-1 border-t md:border-none border-grayModern-200 transition-all duration-300 overflow-hidden',
              step >= 2 && 'row-start-2 sm:h-0',
              step === 1
                ? 'w-[352px] h-[352px] pb-7 md:w-[225px] opacity-100 scale-100'
                : 'w-0 h-0 p-0 opacity-0 scale-95 border-none pointer-events-none',
            )}
          >
            {selectedDayStr && (
              <p className='pt-6 px-4 mb-4 text-sm font-medium animate-fadeIn'>
                {selectedDayStr}
              </p>
            )}
            <div className='px-4 flex flex-col overflow-y-auto gap-2 scrollbar'>
              {selectedDaySlot?.timeSlots.map((time) => {
                return (
                  <Button
                    size='xs'
                    key={time.startTime}
                    className='animate-fadeIn'
                    onClick={() => {
                      setSelectedTimeSlot(time.startTime);
                      setStep(2);
                    }}
                  >
                    {(time.startTime as string).substring(11, 16)}
                  </Button>
                );
              })}
            </div>
          </div>
        </>

        <form
          className={cn(
            'flex flex-col gap-3 h-[352px] pt-6 pb-4 row-start-2 col-span-2 md:row-start-1 border-grayModern-200 border-t md:border-t-0 md:border-l transition-all duration-300 overflow-hidden',
            step > 2 && 'row-start-1',
            step === 2
              ? 'w-[326px] px-4 pt-6 opacity-100 scale-100'
              : 'w-0 opacity-0 px-0 scale-95 border-none pointer-events-none',
          )}
          onSubmit={(e) => {
            e.preventDefault();

            const form = new FormData(e.currentTarget as HTMLFormElement);

            let hasErrors = false;

            for (const [k, v] of form.entries()) {
              if (!(v as string).length) {
                if (!bookingFormPhoneRequired && k === 'phone') {
                  continue;
                }
                hasErrors = true;
                setErrors((prev) => ({
                  ...prev,
                  [k]: 'This field is required',
                }));
              } else {
                setErrors((prev) => {
                  const next = { ...prev };

                  delete next[k];

                  return next;
                });
              }
            }

            if (hasErrors) return;

            const bookingInput: BookingInput = {
              name: form.get('name') as string,
              email: form.get('email') as string,
              phone: (form.get('phone') as string) || undefined,
              startTime: selectedTimeSlot!,
            };

            setParticipantsDetails({
              name: bookingInput.name,
              email: bookingInput.email,
            });

            if (isRescheduling) {
              onReschedule({ ...bookingInput, isRescheduling: true });
            } else {
              onMakeBooking(bookingInput);
            }
          }}
        >
          {bookingFormNameEnabled && (
            <div className='flex flex-col gap-1'>
              <label className='text-sm font-medium after:content-["*"] after:ml-1 text-nowrap'>
                Your name
              </label>
              <Input
                size='sm'
                name='name'
                variant='outline'
                invalid={!!errors['name']}
                placeholder='First and last name'
              />
              {errors['name'] && (
                <span className='text-xs text-error-500 text-nowrap'>
                  {errors['name']}
                </span>
              )}
            </div>
          )}
          {bookingFormEmailEnabled && (
            <div className='flex flex-col gap-1'>
              <label className='text-sm font-medium after:content-["*"] after:ml-1 text-nowrap'>
                Email
              </label>
              <Input
                size='sm'
                name='email'
                variant='outline'
                invalid={!!errors['email']}
                placeholder='Email address'
              />
              {errors['email'] && (
                <span className='text-xs text-error-500 text-nowrap'>
                  {errors['email']}
                </span>
              )}
            </div>
          )}
          {bookingFormPhoneEnabled && (
            <div className='flex flex-col gap-1'>
              <label
                className={cn(
                  'text-sm font-medium text-nowrap',
                  bookingFormPhoneRequired && 'after:content-["*"] after:ml-1',
                )}
              >
                Phone number
              </label>
              <Input
                size='sm'
                name='phone'
                type='number'
                variant='outline'
                placeholder='Phone number'
                invalid={!!errors['phone']}
              />
              {errors['phone'] && (
                <span className='text-xs text-error-500 text-nowrap'>
                  {errors['phone']}
                </span>
              )}
            </div>
          )}

          <div className='w-full flex gap-3 justify-end mt-7 flex-1 items-end'>
            <Button
              size='xs'
              type='button'
              variant='ghost'
              isLoading={isBookingConfirmationLoading}
              onClick={() => {
                setErrors({});
                setStep(1);
                setSelectedTimeSlot(null);
                setParticipantsDetails(null);
              }}
            >
              Back
            </Button>
            <Button
              size='xs'
              type='submit'
              variant='solid'
              colorScheme='black'
              className='text-white'
              isLoading={isBookingConfirmationLoading}
            >
              {isBookingConfirmationLoading
                ? isRescheduling
                  ? 'Rescheduling...'
                  : 'Booking...'
                : isRescheduling
                ? 'Reschedule'
                : 'Book meeting'}
            </Button>
          </div>
        </form>

        <div
          className={cn(
            'flex flex-col animate-fadeIn gap-3 row-start-1 row-span-1 transition-all duration-300 overflow-hidden',
            bookingConfirmation && step === 3
              ? 'w-[450px] h-full max-h-[400px] p-5 opacity-100 scale-100'
              : 'w-0 opacity-0 max-h-[0px] p-0 scale-95 pointer-events-none',
          )}
        >
          <div className='w-full flex justify-center py-4'>
            <FeaturedIcon size='lg' colorScheme='grayModern'>
              <Icon
                name={
                  isCanceling
                    ? 'x-circle'
                    : bookingConfirmation?.status === 'rescheduled'
                    ? 'clock-fast-forward'
                    : bookingConfirmation?.status === 'already_exists'
                    ? 'info-circle'
                    : 'check-circle'
                }
              />
            </FeaturedIcon>
          </div>

          <p className='text-lg font-medium text-center'>
            {isCanceling
              ? bookingConfirmation?.status === 'cancelled'
                ? 'Booking cancelled'
                : 'Cancel this booking'
              : bookingConfirmation?.status === 'rescheduled'
              ? 'Booking rescheduled'
              : bookingConfirmation?.status === 'already_exists'
              ? 'Booking found'
              : 'Booking confirmed'}
          </p>
          {!isCanceling && (
            <p className='text-sm text-center'>
              {'We sent a confirmation email to everyone'}
            </p>
          )}

          {isCanceling && bookingConfirmation?.status === 'cancelled' && (
            <p className='text-sm text-center'>
              {'We sent a cancellation email to everyone'}
            </p>
          )}

          <div className='flex flex-col gap-2 w-full'>
            <div className='flex w-full justify-between'>
              <p className='text-sm font-medium flex-1'>When</p>
              <div className='flex flex-col flex-2 text-sm'>
                <p>{selectedDayStr}</p>
                <p>{selectedTimeRange.join(' - ')}</p>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-2 w-full'>
            <div className='flex w-full justify-between'>
              <p className='text-sm font-medium flex-1'>Who</p>
              <div className='flex flex-col gap-2 flex-2'>
                <div className='flex flex-col text-sm'>
                  <p className='font-medium'>
                    {bookingConfirmation?.hostName}{' '}
                    <span className='bg-grayModern-100 ml-1 p-0.5 rounded-md font-normal'>
                      Host
                    </span>
                  </p>
                  <p>{bookingConfirmation?.hostEmail}</p>
                </div>

                <div className='flex flex-col text-sm'>
                  <p className='font-medium'>{participantDetails?.name}</p>
                  <p>{participantDetails?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-2 w-full'>
            <div className='flex w-full justify-between'>
              <p className='text-sm font-medium flex-1'>Where</p>
              <div className='flex flex-col flex-2 text-sm'>
                <p>{location}</p>
              </div>
            </div>
          </div>

          {!isCanceling ? (
            <div className='w-full flex flex-col items-center pt-3 justify-end'>
              <div className='border-t border-grayModern-200 w-full mb-3' />
              <p className='text-sm'>
                Need to change something?{' '}
                <span
                  className='underline cursor-pointer'
                  onClick={() => {
                    setStep(0);
                    setIsRescheduling(true);
                    setSelectedTimeSlot(null);
                    setSelectedDay(null);
                    setParticipantsDetails(null);
                  }}
                >
                  Reschedule
                </span>{' '}
                or{' '}
                <span
                  className='underline cursor-pointer'
                  onClick={() => {
                    setIsCanceling(true);
                  }}
                >
                  Cancel
                </span>
              </p>
            </div>
          ) : bookingConfirmation?.status !== 'cancelled' ? (
            <div className='flex justify-end w-full gap-3 h-full items-end'>
              <Button
                size='xs'
                variant='ghost'
                onClick={() => setIsCanceling(false)}
                isDisabled={isBookingConfirmationLoading}
              >
                Nevermind
              </Button>
              <Button
                size='xs'
                variant='solid'
                colorScheme='black'
                isDisabled={isBookingConfirmationLoading}
                onClick={() =>
                  onCancel({
                    ...participantDetails!,
                    startTime: selectedTimeSlot!,
                    isCanceling: true,
                  })
                }
              >
                {isBookingConfirmationLoading
                  ? 'Canceling...'
                  : 'Cancel booking'}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <a target='_blank' href='https://www.customeros.ai'>
        <img
          width='130'
          className='mt-2'
          alt='customeros logo'
          src={'/customeros.png'}
        />
      </a>
    </div>
  );
};

const locationIconMap: Record<string, React.ReactElement> = {
  'No location': <Icon name='marker-pin-04' className='text-grayModern-500' />,
  'Phone call': <Icon name='phone-call-01' className='text-grayModern-500' />,
  'Google Meet': <Logo name='google-meet' viewBox='0 0 24 20' />,
};
