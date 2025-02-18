import { FC, useState } from 'react';

import { cn } from '@ui/utils/cn.ts';
import { Combobox } from '@ui/form/Combobox';
import { SelectOption } from '@shared/types/SelectOptions.ts';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';

interface InlineSelectProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value?: string | null;
  options: SelectOption[];
  onChange: (value: SelectOption) => void;
}

export const InlineSelect: FC<InlineSelectProps> = ({
  label,
  placeholder,
  options,
  onChange,
  value,
}) => {
  const [inputValue, setInputValue] = useState('');

  const selectedOption = options?.find((option) => option.value === value);

  return (
    <div className='w-full'>
      <label className='absolute top-[-999999px]'>{label}</label>

      <Popover modal={false}>
        <PopoverTrigger className={'flex items-center w-full'}>
          <span
            className={cn(
              'underline ml-1 text-gray-500 hover:text-gray-700 focus:text-gray-700',
              {
                'text-gray-400': !value,
              },
            )}
          >
            {value || placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent align='start' className='min-w-[80px] z-[99999]'>
          <Combobox
            options={options}
            value={selectedOption}
            inputValue={inputValue}
            closeMenuOnSelect={true}
            placeholder={placeholder}
            onInputChange={setInputValue}
            onChange={(newValue) => {
              onChange(newValue);
            }}
            noOptionsMessage={({ inputValue }) => (
              <div className='text-gray-700 px-3 py-1 mt-0.5 rounded-md bg-grayModern-100 gap-1 flex items-center'>
                <span>{`No results matching "${inputValue}"`}</span>
              </div>
            )}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
