import { FC } from 'react';

import { Receipt } from '@ui/media/icons/Receipt';
import { FeaturedIcon } from '@ui/media/Icon/FeaturedIcon';

export const EmptyIssueMessage: FC<{
  title?: string;
  description?: string;
  children?: React.ReactNode;
}> = ({ children, title, description }) => (
  <div className='flex flex-col items-center mt-4'>
    <FeaturedIcon size='md' className='mb-[15px]' colorScheme='grayModern'>
      <Receipt className='text-grayModern-700 size-6' />
    </FeaturedIcon>
    {title && (
      <span className='text-grayModern-700 font-semibold mb-1'>{title}</span>
    )}

    <span className='mt-1 mb-6 text-center text-grayModern-500'>
      {children ?? description}
    </span>
  </div>
);
