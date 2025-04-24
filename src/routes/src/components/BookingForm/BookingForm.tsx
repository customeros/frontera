import { Avatar } from '@/ui/media/Avatar';
import { DatePicker } from '@/ui/form/DatePicker/DatePicker';

export const BookingForm = () => {
  return (
    <div className='flex h-full w-full justify-center items-center'>
      <div className='flex border border-r-grayModern-300'>
        <div className='h-full'>
          <div className='flex gap-2'>
            <Avatar size='md' name='Robert Inc' variant='outlineSquare' />
            <h1>Robert Inc</h1>
          </div>
        </div>

        <div className='flex flex-col items-center border-x border-x-grayModern-300'>
          <h1>Calendar</h1>
          <div>
            <DatePicker />
          </div>
        </div>

        <div className='h-full'>Right</div>
      </div>
    </div>
  );
};
