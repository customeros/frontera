import React from 'react';

import { twMerge } from 'tailwind-merge';

interface IconProps extends React.SVGAttributes<SVGElement> {
  className?: string;
}

export const Hubspot = ({ className, ...props }: IconProps) => (
  <svg
    fill='none'
    viewBox='0 0 32 32'
    {...props}
    className={twMerge('inline-block size-4', className)}
  >
    <g clipPath='url(#clip0_5835_1470)'>
      <path
        fill='#FF7A59'
        d='M23.0254 11.4782V8.18994C23.4599 7.98685 23.8279 7.66451 24.0863 7.26045C24.3448 6.85639 24.4832 6.38723 24.4854 5.90757V5.83212C24.4854 4.43361 23.3517 3.29989 21.9533 3.29989H21.8777C20.4792 3.29989 19.3455 4.43361 19.3455 5.83212V5.90757C19.3477 6.38723 19.4861 6.85639 19.7446 7.26045C20.0031 7.66451 20.371 7.98685 20.8055 8.18994V11.4782C19.5566 11.6695 18.3804 12.1873 17.396 12.9794L8.37773 5.95504C8.44204 5.72291 8.47558 5.48419 8.47937 5.24459C8.48047 4.68024 8.31418 4.12825 8.00152 3.65843C7.68887 3.18861 7.2439 2.82207 6.7229 2.60517C6.2019 2.38828 5.62828 2.33077 5.07459 2.43992C4.5209 2.54908 4.01203 2.81999 3.61233 3.2184C3.21263 3.6168 2.94007 4.1248 2.82912 4.67813C2.71817 5.23146 2.77382 5.80526 2.98902 6.32696C3.20423 6.84866 3.56932 7.29482 4.03813 7.609C4.50693 7.92317 5.05838 8.09126 5.62273 8.09198C6.11642 8.08966 6.60087 7.95785 7.0277 7.70973L15.9081 14.62C14.2755 17.0864 14.3192 20.3008 16.0181 22.722L13.3172 25.4238C13.0987 25.354 12.8714 25.3169 12.6421 25.3138C11.3486 25.3149 10.3007 26.3639 10.301 27.6574C10.3014 28.9509 11.3499 29.9993 12.6434 29.9997C13.9369 30 14.9859 28.9521 14.987 27.6586C14.984 27.4294 14.9469 27.2019 14.8769 26.9837L17.5489 24.3107C19.9364 26.1486 23.2154 26.307 25.7689 24.7076C28.3223 23.1082 29.611 20.0887 28.9991 17.1386C28.3873 14.1883 26.0043 11.9305 23.0254 11.4782ZM21.9179 22.2931C21.4242 22.3064 20.9329 22.2206 20.473 22.0409C20.013 21.8611 19.5938 21.5911 19.2399 21.2466C18.8861 20.9022 18.6048 20.4903 18.4128 20.0354C18.2208 19.5804 18.1218 19.0916 18.1218 18.5978C18.1218 18.104 18.2208 17.6152 18.4128 17.1603C18.6048 16.7053 18.8861 16.2935 19.2399 15.949C19.5938 15.6046 20.013 15.3345 20.473 15.1548C20.9329 14.975 21.4242 14.8893 21.9179 14.9026C23.9071 14.9722 25.4841 16.6045 25.4852 18.5951C25.4861 20.5855 23.9108 22.2195 21.9215 22.2912'
      />
    </g>
    <defs>
      <clipPath id='clip0_5835_1470'>
        <rect width='28' height='28' fill='white' transform='translate(2 2)' />
      </clipPath>
    </defs>
  </svg>
);
