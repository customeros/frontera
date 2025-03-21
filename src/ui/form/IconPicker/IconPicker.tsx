import { cn } from '@ui/utils/cn';
import { Input } from '@ui/form/Input';
import { Icon, IconName } from '@ui/media/Icon';
import { Button } from '@ui/form/Button/Button';
import { IconButton } from '@ui/form/IconButton';

interface IconAndColorPickerProps {
  color?: string;
  icon?: IconName;
  iconOptions: IconName[];
  iconSearchValue: string;
  colorsMap: Record<string, string>;
  onIconSearch: (query: string) => void;
  onIconChange: (icon: IconName) => void;
  onColorChange: (color: string) => void;
}

export const IconPicker = ({
  icon,
  color,
  iconOptions,
  colorsMap,
  onIconChange,
  onIconSearch,
  onColorChange,
  iconSearchValue,
}: IconAndColorPickerProps) => {
  return (
    <div className='flex flex-col gap-2 w-64'>
      <div className={'w-full flex justify-evenly gap-2  bg-grayModern-700'}>
        {Object.entries(colorsMap).map(([c, bg]) => (
          <Button
            key={c}
            variant={'ghost'}
            onClick={() => onColorChange(c)}
            className='p-0 hover:bg-transparent hover:focus:bg-transparent cursor-pointer '
          >
            <div
              className={cn(`size-4 rounded-full ring-0 `, bg, {
                [`ring-1 ring-offset-2 ring-offset-grayModern-700`]:
                  color === c,
              })}
            />
          </Button>
        ))}
      </div>

      <div className='relative border-t border-grayModern-600 pt-2 mt-[6px]'>
        <Input
          type='text'
          size={'sm'}
          variant={'unstyled'}
          placeholder='Search'
          value={iconSearchValue}
          className={'text-grayModern-25'}
          onChange={(e) => onIconSearch(e.target.value)}
        />
      </div>

      <div className='grid grid-cols-10 gap-2 overflow-y-auto p-1'>
        {iconOptions.map((iconName) => (
          <IconButton
            size={'xxs'}
            key={iconName}
            variant={'ghost'}
            aria-label={iconName}
            colorScheme={'grayModern'}
            icon={
              <Icon name={iconName} className={'text-inherit size-[14px]'} />
            }
            onClick={(e) => {
              e.stopPropagation();
              onIconChange(iconName);
            }}
            className={cn(
              `text-grayModern-50 hover:text-grayModern-50 hover:bg-grayModern-600 focus:text-grayModern-50 focus:bg-grayModern-600 transition-colors `,
              {
                '!bg-grayModern-600 !text-grayModern-25 hover:bg-grayModern-600 !hover:text-grayModern-50':
                  icon === iconName,
              },
            )}
          />
        ))}
      </div>
    </div>
  );
};
