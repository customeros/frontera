import { cn } from '@/ui/utils/cn';

import { BookingWidget } from '@shared/components/BookingForm';

export const BookingPage = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const calendarId = searchParams.get('calendarId');
  const isEmbedded = (searchParams.get('mode') ?? 'page') === 'embedded';

  return (
    <div
      className={cn(
        !isEmbedded && 'h-screen w-screen bg-grayModern-50 overflow-auto py-4',
      )}
    >
      <div
        className={cn(
          !isEmbedded && 'flex items-center justify-center md:h-[80%]',
        )}
      >
        {calendarId ? (
          <BookingWidget calendarId={calendarId} isEmbedded={isEmbedded} />
        ) : (
          <div>Missing calendarId</div>
        )}
      </div>
    </div>
  );
};
