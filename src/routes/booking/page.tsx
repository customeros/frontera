import { useState, useEffect } from 'react';

import { SelectOption } from '@/ui/utils/types';

import { unwrap } from '@utils/unwrap';
import {
  BookingForm,
  BookingInput,
  BookingResponse,
} from '@shared/components/BookingForm';
import {
  CalendarAvailabilityResponse,
  CalendarAvailabilityDetailsResponse,
} from '@graphql/types';

const cache = new Map();

const API_ENDPOINT = 'https://api.customeros.ai';

export const BookingPage = () => {
  const [timezones, setTmezones] = useState<SelectOption[]>([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);
  const [isTimezonesLoading, setIsTimezonesLoading] = useState(true);
  const [bookingInput, setBookingInput] = useState<BookingInput | null>();
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);

  const [timezone, setTimezone] = useState<SelectOption>(() => ({
    value: Intl.DateTimeFormat().resolvedOptions().timeZone,
    label: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }));
  const [activeMonth, setActiveMonth] = useState<number>(
    () => new Date().getMonth() + 1,
  );
  const [activeYear, setActiveYear] = useState<number>(() =>
    new Date().getFullYear(),
  );
  const [availability, setAvailability] = useState<CalendarAvailability>(
    () => new CalendarAvailability(),
  );
  const [details, setDetails] = useState<CalendarDetails>(
    () => new CalendarDetails(),
  );
  const [bookingConfirmation, setBookingConfirmation] =
    useState<BookingResponse | null>(null);
  const [isBookingConfirmationLoading, setIsBookingConfirmationLoading] =
    useState(false);

  const calendarId = new URLSearchParams(window.location.search).get(
    'calendarId',
  );

  const getTimezones = async (): Promise<{
    timezones: SelectOption[];
  }> => {
    setIsTimezonesLoading(true);

    const [res, err] = await unwrap(
      fetch(`${API_ENDPOINT}/calendar/timezones`),
    );

    setIsTimezonesLoading(false);

    if (err) {
      console.error(err);
    }

    if (res) {
      return (await res.json()) as {
        timezones: SelectOption[];
      };
    }

    return { timezones: [] };
  };

  const getAvailability = async (
    month: number,
    year: number,
  ): Promise<CalendarAvailability> => {
    const params = new URLSearchParams();
    const cacheKey = computeCacheKey(month, year, timezone.value);

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    if (!calendarId) {
      console.error(
        'Calendar ID param is missing. Abort fetching availability.',
      );

      return new CalendarAvailability();
    }

    params.set('calendarId', calendarId);
    params.set('month', activeMonth.toString());
    params.set('year', activeYear.toString());
    params.set('timezone', timezone.value);

    setIsAvailabilityLoading(true);

    const [res, err] = await unwrap(
      fetch(`${API_ENDPOINT}/calendar/availability?${params.toString()}`),
    );

    if (err) {
      console.error(err);
    }

    setIsAvailabilityLoading(false);

    const value = await res?.json();

    cache.set(cacheKey, value);

    return await value;
  };

  const getDetails = async () => {
    const params = new URLSearchParams();

    if (!calendarId) {
      console.error('Calendar ID param is missing. Abort fetching details.');

      return new CalendarDetails();
    }

    params.set('calendarId', calendarId);

    setIsDetailsLoading(true);

    const [res, err] = await unwrap(
      fetch(`https://api.customeros.ai/calendar/details?${params.toString()}`),
    );

    if (err) {
      console.error(err);
    }

    setIsDetailsLoading(false);

    const value = await res?.json();

    return await value;
  };

  useEffect(() => {
    (async () => {
      const detailsData = await getDetails();

      setDetails(new CalendarDetails(detailsData));

      const timezonesData = await getTimezones();

      if (timezonesData) {
        setTmezones(timezonesData.timezones);

        const defaultTimezone = timezonesData.timezones.find(
          (t) => t.value === Intl.DateTimeFormat().resolvedOptions().timeZone,
        );

        if (defaultTimezone) {
          setTimezone(defaultTimezone);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const availability = await getAvailability(activeMonth, activeYear);

      setAvailability(new CalendarAvailability(availability));
    })();
  }, [activeMonth, activeYear, timezone.value]);

  useEffect(() => {
    if (!bookingInput) return;

    (async () => {
      setIsBookingConfirmationLoading(true);

      const [res, err] = await unwrap(
        fetch(`${API_ENDPOINT}/calendar/meeting`, {
          method: bookingInput.isRescheduling
            ? 'PUT'
            : bookingInput?.isCanceling
            ? 'DELETE'
            : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...bookingInput,
            calendarId,
            timezone: timezone.value,
          }),
        }),
      );

      setIsBookingConfirmationLoading(false);

      if (err) {
        console.error(err);
      }

      if (res) {
        const value = await res.json();

        setBookingConfirmation(value);
      }
    })();
  }, [bookingInput]);

  return (
    <div className='bg-grayModern-50 h-screen'>
      <BookingForm
        timezone={timezone}
        timezones={timezones}
        onCancel={setBookingInput}
        onTimezoneChange={setTimezone}
        onReschedule={setBookingInput}
        onMakeBooking={setBookingInput}
        isDetailsLoading={isDetailsLoading}
        isTimezonesLoading={isTimezonesLoading}
        bookingConfirmation={bookingConfirmation}
        isAvailabilityLoading={isAvailabilityLoading}
        isBookingConfirmationLoading={isBookingConfirmationLoading}
        onActiveStartDate={(date) => {
          if (date) {
            setActiveMonth(date.getMonth() + 1);
            setActiveYear(date.getFullYear());
          }
        }}
        {...details}
        {...availability}
      />
    </div>
  );
};

class CalendarDetails implements CalendarAvailabilityDetailsResponse {
  tenantLogoUrl: CalendarAvailabilityDetailsResponse['tenantLogoUrl'] = '';
  location: CalendarAvailabilityDetailsResponse['location'] = '';
  tenantName: CalendarAvailabilityDetailsResponse['tenantName'] = '';
  bookingDescription: CalendarAvailabilityDetailsResponse['bookingDescription'] =
    '';
  bookingTitle: CalendarAvailabilityDetailsResponse['bookingTitle'] = '';
  durationMins: CalendarAvailabilityDetailsResponse['durationMins'] = 0;
  bookingFormNameEnabled: CalendarAvailabilityDetailsResponse['bookingFormNameEnabled'] =
    false;
  bookingFormEmailEnabled: CalendarAvailabilityDetailsResponse['bookingFormEmailEnabled'] =
    false;
  bookingFormPhoneEnabled: CalendarAvailabilityDetailsResponse['bookingFormPhoneEnabled'] =
    false;
  bookingFormPhoneRequired: CalendarAvailabilityDetailsResponse['bookingFormPhoneRequired'] =
    false;

  constructor(data?: Partial<CalendarAvailabilityDetailsResponse>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

class CalendarAvailability implements CalendarAvailabilityResponse {
  days: CalendarAvailabilityResponse['days'] = [];

  constructor(data?: Partial<CalendarAvailabilityResponse>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

const computeCacheKey = (month: number, year: number, timezone: string) =>
  timezone + ':' + month + ':' + year;
