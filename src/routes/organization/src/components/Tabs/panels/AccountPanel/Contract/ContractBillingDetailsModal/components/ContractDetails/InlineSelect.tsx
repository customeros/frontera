import { useState } from 'react';

import { cn } from '@ui/utils/cn.ts';
import { Combobox } from '@ui/form/Combobox';
import { SelectOption } from '@shared/types/SelectOptions.ts';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';

interface InlineSelectProps<T> {
  id: string;
  name: string;
  label: string;
  value?: T | null;
  placeholder: string;
  options: SelectOption<T>[];
  onChange: (value: SelectOption<T>) => void;
}

export const InlineSelect = <T,>({
  label,
  placeholder,
  options,
  onChange,
  value,
}: InlineSelectProps<T>): JSX.Element => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const selectedOption = options?.find((option) => option.value === value);

  return (
    <div className='w-full'>
      <label className='absolute top-[-999999px]'>{label}</label>

      <Popover open={open} modal={false} onOpenChange={setOpen}>
        <PopoverTrigger className='flex items-center w-full'>
          <span
            className={cn(
              'underline ml-1 text-grayModern-500 hover:text-grayModern-700 focus:text-grayModern-700',
              {
                'text-grayModern-400': value === null || value === undefined,
              },
            )}
          >
            {(value !== null && value !== undefined
              ? options.find((opt) => opt.value === value)?.label
              : placeholder) || placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent align='start' className='min-w-[80px] z-[99999]'>
          <Combobox
            options={options}
            isSearchable={false}
            value={selectedOption}
            inputValue={inputValue}
            placeholder={placeholder}
            onInputChange={setInputValue}
            onChange={(newValue) => {
              onChange(newValue);
              setOpen(false);
            }}
            noOptionsMessage={({ inputValue }) => (
              <div className='text-grayModern-700 px-3 py-1 mt-0.5 rounded-md bg-grayModern-100 gap-1 flex items-center'>
                <span>{`No results matching "${inputValue}"`}</span>
              </div>
            )}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
