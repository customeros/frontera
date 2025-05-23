import { Link } from 'react-router-dom';
import React, { memo, useRef, useState } from 'react';

import { LinkExternal02 } from '@ui/media/icons/LinkExternal02';

import { Input } from '../Input/Input';
import { formatSocialUrl } from './util';
import { IconButton } from '../IconButton/IconButton';

export interface UrlInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value: string;
  label?: string;
  dataTest?: string;
  isLabelVisible?: boolean;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
}

export const UrlInput = memo(
  ({
    value,
    onBlur,
    isLabelVisible,
    label,
    labelProps,
    dataTest,
    ...rest
  }: UrlInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const href = value?.startsWith('http') ? value : `https://${value}`;

    const formattedUrl = formatSocialUrl(value, true);

    const handleFocus = () => {
      setIsFocused(true);
      inputRef.current?.focus();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
      setIsFocused(false);
    };

    return (
      <div className='w-full'>
        {isLabelVisible ? (
          <label {...labelProps}>{label}</label>
        ) : (
          <label className='sr-only'>{label}</label>
        )}

        <div className='relative'>
          <Input
            size='xs'
            value={value}
            ref={inputRef}
            variant='unstyled'
            onBlur={handleBlur}
            dataTest={dataTest}
            onFocus={handleFocus}
            className='border border-transparent text-sm'
            {...rest}
          />
          {!isFocused && !!value && (
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className='bg-grayModern-25 w-full absolute top-[1px] hover:border-grayModern-300 hover:border-b border-b border-transparent'
            >
              <p
                onClick={handleFocus}
                className='text-grayModern-700 top-0 truncate text-sm'
              >
                {formattedUrl}
              </p>
              {isHovered && (
                <Link
                  to={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='absolute -top-[1px] right-0 flex items-center text-grayModern-500 hover:text-grayModern-900'
                >
                  <IconButton
                    size='xxs'
                    variant='ghost'
                    className='mt-[5px]'
                    colorScheme='grayModern'
                    aria-label='social link'
                    icon={<LinkExternal02 />}
                  />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
