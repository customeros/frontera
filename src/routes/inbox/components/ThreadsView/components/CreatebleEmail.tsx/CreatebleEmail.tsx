import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Plus } from '@ui/media/icons/Plus';
import { Combobox } from '@ui/form/Combobox';
import { Menu } from '@ui/overlay/Menu/Menu';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { SelectOption } from '@shared/types/SelectOptions';
import { MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import {
  Tag,
  TagLabel,
  TagRightIcon,
  TagRightButton,
} from '@ui/presentation/Tag';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/overlay/Popover/Popover.tsx';

interface CreatebleEmailProps {
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

export const CreatebleEmail = observer(
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
  }: CreatebleEmailProps) => {
    const store = useStore();

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
                  <Tag
                    size={'md'}
                    variant='subtle'
                    key={option.value}
                    colorScheme={'grayModern'}
                  >
                    <TagLabel>{option.label}</TagLabel>
                    <TagRightIcon>
                      <Menu>
                        <MenuButton>
                          <Icon name={'menu-01'} className='ml-1' />
                        </MenuButton>
                        <MenuList>
                          <MenuItem>
                            <Icon name={'x-close'} />
                            <span>Remove</span>
                          </MenuItem>
                          <MenuItem>
                            <Icon name={'x-close'} />
                            <span>copy email</span>
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </TagRightIcon>
                  </Tag>
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
                <span>{`Create "${inputValue}"`}</span>
              </div>
            )}
          />
        </PopoverContent>
      </Popover>
    );
  },
);
