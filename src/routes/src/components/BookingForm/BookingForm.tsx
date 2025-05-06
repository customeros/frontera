import { useRef, useState, useEffect } from 'react';

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
import { getMenuListClassNames } from '@ui/form/Select';
import {
  CalendarAvailabilityResponse,
  CalendarAvailabilityDetailsResponse,
} from '@graphql/types';

export type BookingInput = {
  name: string;
  email: string;
  phone?: string;
  eventId?: string;
  startTime: string;
  isCanceling?: boolean;
  isRescheduling?: boolean;
};

export type BookingResponse = {
  endTime: string;
  eventId: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [breakpoint, setBreakpoint] = useState<TailwindBreakpoint>(() => {
    return 'md';
  });
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

  useResizePostMessage(containerRef, [breakpoint, step]);

  useEffect(() => {
    window.parent.postMessage({ type: 'MOUNTED' }, '*');

    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'PARENT_BREAKPOINT') {
        const bp = event.data.breakpoint as TailwindBreakpoint;

        setBreakpoint(bp);
      }
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  });

  return (
    <div className='animate-fadeIn overflow-x-hidden'>
      <div
        ref={containerRef}
        className={cn(
          'flex w-fit min-h-[354px] flex-col border border-grayModern-200 rounded-xl shadow-xs bg-white transition-all duration-500 overflow-hidden',
          breakpoint !== 'sm' && 'flex-row',
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 flex flex-col gap-3 transition-all duration-300 overflow-hidden',
            step < 3
              ? 'max-w-[352px] min-w-[225px] py-7 px-4 opacity-100 scale-100'
              : 'max-w-0 min-w-0 h-0 opacity-0 scale-95 py-0 px-0',
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
                  step > 0 && 'pointer-events-none opacity-75',
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
                classNames={{
                  menuList: () =>
                    getMenuListClassNames(
                      cn(
                        'p-0 border-none bg-transparent shadow-none scrollbar max-h-[150px]',
                      ),
                    ),
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div
          className={cn(
            'flex flex-col flex-1 transition-all duration-300',
            breakpoint !== 'sm' && 'flex-row',
          )}
        >
          <div
            className={cn(
              'transition-all duration-300 border-grayModern-200 overflow-hidden sal',
              breakpoint !== 'sm' ? 'border-l' : 'border-t',
              step < 2
                ? 'max-w-[352px] min-w-[352px] w-full opacity-100 scale-100'
                : 'max-w-0 min-w-0 h-0 opacity-0 scale-95 pointer-events-none',
            )}
          >
            <DatePicker
              view='month'
              minDetail='month'
              minDate={new Date()}
              className='min-w-[352px] !w-full'
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

                if (foundIndex > -1) return 'available';
              }}
            />
          </div>

          <div
            className={cn(
              'w-full bg-white flex flex-col border-grayModern-200 transition-all duration-300 overflow-hidden',
              breakpoint !== 'sm' ? 'border-l' : 'border-t',
              step === 1
                ? 'h-[352px] min-w-[225px] max-w-[352px] pb-7 opacity-100 scale-100'
                : 'h-0 min-w-0 max-w-0 opacity-0 pb-0 scale-95 pointer-events-none',
            )}
          >
            {selectedDayStr && (
              <p className='pt-6 px-4 mb-4 text-sm font-medium animate-fadeIn'>
                {selectedDayStr}
              </p>
            )}
            <div className='px-4 flex flex-col overflow-y-auto gap-2 scrollbar'>
              {selectedDaySlot?.timeSlots.map((time) => (
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
              ))}
            </div>
          </div>

          <form
            className={cn(
              'flex flex-col gap-3 pt-6 pb-4 border-grayModern-200 transition-all duration-300 overflow-hidden',
              breakpoint !== 'sm' ? 'border-l' : 'border-t',
              step === 2
                ? 'w-full min-w-[352px] max-w-[352px] pt-6 pb-4 px-4 opacity-100 scale-100'
                : 'w-0 min-w-0 max-w-0 h-0 opacity-0 pt-0 pb-0 px-0 scale-95 pointer-events-none',
            )}
            onSubmit={(e) => {
              e.preventDefault();

              const form = new FormData(e.currentTarget as HTMLFormElement);
              let hasErrors = false;

              for (const [k, v] of form.entries()) {
                if (!(v as string).length) {
                  if (!bookingFormPhoneRequired && k === 'phone') continue;
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
                onReschedule({
                  ...bookingInput,
                  isRescheduling: true,
                  eventId: bookingConfirmation?.eventId,
                });
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
                    bookingFormPhoneRequired &&
                      'after:content-["*"] after:ml-1',
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
              'flex flex-col animate-fadeIn gap-3 transition-all duration-300 overflow-hidden',
              bookingConfirmation && step === 3
                ? 'w-[450px] max-h-[400px] p-5 opacity-100 scale-100'
                : 'w-0 max-h-0 p-0 opacity-0 scale-95 pointer-events-none',
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
                We sent a confirmation email to everyone
              </p>
            )}
            {isCanceling && bookingConfirmation?.status === 'cancelled' && (
              <p className='text-sm text-center'>
                We sent a cancellation email to everyone
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
                      {bookingConfirmation?.hostName}
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
                  Need to change something?
                  <span
                    className='underline cursor-pointer ml-1'
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
                      eventId: bookingConfirmation?.eventId,
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
      </div>

      <a target='_blank' href='https://www.customeros.ai'>
        <img
          width='130'
          alt='customeros logo'
          src='/customeros.png'
          className='mt-2 mx-auto'
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

function useResizePostMessage(
  ref: React.RefObject<HTMLElement>,
  when: unknown[],
) {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;

      window.parent.postMessage(
        { type: 'RESIZE', width: width + 2, height: height + 56 },
        '*',
      );
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, ...when]);
}

export type TailwindBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export function getTailwindBreakpoint(width: number): TailwindBreakpoint {
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';

  return 'sm';
}
