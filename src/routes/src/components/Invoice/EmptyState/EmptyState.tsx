import { Icon } from '@ui/media/Icon';
import { FeaturedIcon } from '@ui/media/Icon/FeaturedIcon';

import HalfCirclePattern from '../../../assets/HalfCirclePattern';

export const EmptyState = ({ companyName }: { companyName: string }) => {
  return (
    <div className='flex flex-col h-full w-full max-w-[448px]'>
      <div className='flex relative'>
        <FeaturedIcon
          size='lg'
          colorScheme='grayModern'
          className='absolute top-[26%] justify-self-center right-0 left-0'
        >
          <Icon name='invoice' />
        </FeaturedIcon>
        <HalfCirclePattern />
      </div>
      <div className='flex flex-col text-center items-center translate-y-[-212px]'>
        <p className='text-grayModern-700 text-md font-semibold mb-1'>
          No upcoming invoices
        </p>
        <p className='text-sm my-1 max-w-[360px] text-center'>
          To see invoices for {companyName}, turn the Cashflow Guardian agent on
          and complete their contract with products and billing details.
        </p>
      </div>
    </div>
  );
};
