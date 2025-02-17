import React from 'react';

import { twMerge } from 'tailwind-merge';

interface IconProps extends React.SVGAttributes<SVGElement> {
  className?: string;
}

export const Intercom2 = ({ className, ...props }: IconProps) => (
  <svg
    fill='none'
    viewBox='0 0 32 32'
    {...props}
    className={twMerge('inline-block size-4', className)}
  >
    <path
      fill='#3290E8'
      fillRule='evenodd'
      clipRule='evenodd'
      d='M25 4H7C5.36458 3.99745 4.00289 5.36757 4 7V25C4 26.6567 5.34352 28 7 28H25C26.6354 28.0025 27.9971 26.6324 28 25V7C28 5.34334 26.6571 4 25 4ZM19.1993 8.4C19.1993 7.95867 19.5581 7.6 20 7.6C20.4419 7.6 20.8 7.95867 20.8 8.4V19.0887C20.8 19.53 20.4412 19.8887 20 19.8887C19.5765 19.889 19.2011 19.5136 19.2 19.0887L19.1993 8.4ZM15.1993 7.99534C15.1993 7.55334 15.5581 7.19534 16 7.19534C16.4419 7.19534 16.8007 7.55334 16.8007 7.99534V19.5953C16.8007 20.0373 16.4419 20.3953 16 20.3953C15.5765 20.3957 15.2011 20.0203 15.2 19.5953L15.1993 7.99534ZM11.2 8.4C11.2 7.95867 11.5588 7.6 12 7.6C12.4419 7.6 12.8 7.95867 12.8 8.4V19.0887C12.8 19.53 12.4419 19.8887 12 19.8887C11.5765 19.889 11.2011 19.5136 11.2 19.0887V8.4ZM7.2 10C7.2 9.558 7.55814 9.2 8 9.2C8.44186 9.2 8.8 9.558 8.8 10V17.1953C8.8 17.6373 8.4412 17.9953 8 17.9953C7.56385 17.9961 7.20072 17.6307 7.2 17.1953V10ZM24.5209 22.2027C24.398 22.3093 21.4339 24.7953 16 24.7953C10.5661 24.7953 7.60399 22.3087 7.47907 22.202C7.14854 21.9188 7.10942 21.405 7.39269 21.0747C7.66884 20.7532 8.19583 20.712 8.51827 20.9867C8.56478 21.026 11.2113 23.1953 15.9993 23.1953C20.8472 23.1953 23.4532 21.01 23.4784 20.9887C23.8004 20.712 24.3294 20.7523 24.606 21.0747C24.8911 21.4043 24.8525 21.9196 24.5209 22.2027ZM24.8 17.196C24.8 17.6373 24.4412 17.996 24 17.996C23.5639 17.9967 23.2007 17.6313 23.2 17.196V10C23.2 9.558 23.5581 9.2 23.9993 9.2C24.4412 9.2 24.8 9.558 24.8 10V17.196Z'
    />
  </svg>
);
