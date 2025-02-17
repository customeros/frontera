import React from 'react';

import { twMerge } from 'tailwind-merge';

interface IconProps extends React.SVGAttributes<SVGElement> {
  className?: string;
}

export const Tiktok = ({ className, ...props }: IconProps) => (
  <svg
    fill='none'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    className={twMerge('inline-block size-4', className)}
  >
    <path
      fill='#FF004F'
      d='M17.1762 8.66347C18.7196 9.77064 20.6102 10.4221 22.6523 10.4221V6.47861C22.2658 6.47869 21.8803 6.43825 21.5023 6.35786V9.46193C19.4604 9.46193 17.57 8.81049 16.0262 7.7034V15.7509C16.0262 19.7766 12.7743 23.0399 8.76309 23.0399C7.26641 23.0399 5.87531 22.5858 4.71973 21.807C6.03864 23.1604 7.87796 24 9.91285 24C13.9243 24 17.1764 20.7367 17.1764 16.7108V8.66347H17.1762ZM18.5949 4.68499C17.8061 3.82023 17.2883 2.70267 17.1762 1.46717V0.959961H16.0864C16.3607 2.53028 17.2964 3.87187 18.5949 4.68499ZM7.25681 18.7178C6.81614 18.1379 6.578 17.4286 6.57907 16.6992C6.57907 14.858 8.06647 13.3651 9.90153 13.3651C10.2435 13.365 10.5835 13.4176 10.9094 13.5214V9.48977C10.5285 9.43739 10.1441 9.41515 9.75986 9.4233V12.5613C9.4337 12.4575 9.0936 12.4048 8.75152 12.4051C6.91646 12.4051 5.42914 13.8979 5.42914 15.7393C5.42914 17.0414 6.1726 18.1687 7.25681 18.7178Z'
    />
    <path
      fill='black'
      d='M16.0265 7.70332C17.5702 8.81041 19.4607 9.46185 21.5025 9.46185V6.35778C20.3628 6.11414 19.3538 5.5164 18.5951 4.68499C17.2966 3.87179 16.361 2.5302 16.0867 0.959961H13.2241V16.7106C13.2176 18.5468 11.7327 20.0336 9.90162 20.0336C8.82257 20.0336 7.86394 19.5174 7.25682 18.7178C6.17269 18.1687 5.42923 17.0413 5.42923 15.7394C5.42923 13.8981 6.91655 12.4052 8.75161 12.4052C9.1032 12.4052 9.44208 12.4602 9.75995 12.5614V9.42338C5.81921 9.50509 2.6499 12.7365 2.6499 16.7107C2.6499 18.6946 3.43913 20.4931 4.72006 21.8071C5.87565 22.5858 7.26675 23.04 8.76342 23.04C12.7747 23.04 16.0265 19.7765 16.0265 15.7509V7.70332H16.0265Z'
    />
    <path
      fill='#00F2EA'
      d='M21.5025 6.3578V5.51848C20.4748 5.52005 19.4672 5.23119 18.5952 4.68493C19.3671 5.53306 20.3835 6.11787 21.5025 6.3578ZM16.0867 0.959983C16.0605 0.809911 16.0404 0.658851 16.0265 0.507214V0H12.074V15.7508C12.0677 17.5868 10.5829 19.0736 8.75164 19.0736C8.214 19.0736 7.70638 18.9455 7.25685 18.7179C7.86397 19.5174 8.82259 20.0336 9.90164 20.0336C11.7326 20.0336 13.2177 18.5469 13.2241 16.7107V0.959983H16.0867ZM9.76014 9.42341V8.52989C9.42988 8.48459 9.09691 8.46186 8.76353 8.46202C4.75192 8.46194 1.5 11.7254 1.5 15.7508C1.5 18.2745 2.77806 20.4987 4.72017 21.807C3.43924 20.493 2.65001 18.6944 2.65001 16.7106C2.65001 12.7365 5.81924 9.50511 9.76014 9.42341Z'
    />
  </svg>
);
