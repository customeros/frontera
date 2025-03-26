import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Plus } from '@ui/media/icons/Plus';
import { Combobox } from '@ui/form/Combobox';
import { Menu } from '@ui/overlay/Menu/Menu';
import { SelectOption } from '@shared/types/SelectOptions';
import { MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/overlay/Popover/Popover.tsx';

interface CreatebleEmailAddressProps {
  dataTest?: string;
  className?: string;
  inputValue: string;
  placeholder?: string;
  value: SelectOption[];
  options: SelectOption[];
  inputPlaceholder?: string;
  leftAccessory?: React.ReactNode;
  onCreate: (value: string) => void;
  setInputValue: (value: string) => void;
  onChange: (selection: SelectOption[]) => void;
}

export const CreatebleEmailAdress = observer(
  ({
    value,
    options,
    onChange,
    onCreate,
    className,
    placeholder,
    leftAccessory,
    inputPlaceholder,
    dataTest,
    inputValue,
    setInputValue,
  }: CreatebleEmailAddressProps) => {
    const handleClear = (id: string) => {
      onChange?.(value.filter((o) => o.value !== id));
    };

    return (
      <Popover>
        <PopoverTrigger className={cn('flex items-center w-full', className)}>
          {leftAccessory}
          <div
            data-test={dataTest}
            className='flex flex-wrap gap-1 w-fit items-center'
          >
            {value.length ? (
              value.map((option) => {
                return (
                  <div className='flex items-center gap-[2px] hover:bg-grayModern-100 rounded-md p-[4px]'>
                    <p className='text-sm font-medium '>{option.label}</p>
                    <Menu>
                      <MenuButton>
                        <Icon className='ml-1' name={'chevron-down'} />
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => handleClear(option.value)}>
                          <div className='flex items-center gap-1'>
                            <p>Remove address</p>
                          </div>
                        </MenuItem>
                        <MenuItem>
                          <p>{option.label}</p>
                          <Icon
                            name='copy-03'
                            className='text-grayModern-400 size-4'
                          />
                        </MenuItem>
                        <MenuItem>
                          <p>Add to contacts</p>
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </div>
                );
              })
            ) : (
              <span className='text-grayModern-400 text-sm'>{placeholder}</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent align='start' className='min-w-[264px] max-w-[320px]'>
          <Combobox
            isMulti
            value={value}
            options={options}
            onChange={onChange}
            backspaceRemovesValue
            inputValue={inputValue}
            onInputChange={setInputValue}
            placeholder={inputPlaceholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !options.length) {
                onCreate?.(inputValue);
                setInputValue('');
              }
            }}
            noOptionsMessage={({ inputValue }) => (
              <div
                className='text-grayModern-700 px-3 py-1 mt-0.5 rounded-md bg-grayModern-100 gap-1 flex items-center'
                onClick={() => {
                  onCreate?.(inputValue);
                  setInputValue('');
                }}
              >
                <Plus />
                <span>{`Add new email:"${inputValue}"`}</span>
              </div>
            )}
          />
        </PopoverContent>
      </Popover>
    );
  },
);
