import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { Portal } from '@radix-ui/react-portal';

import { cn } from '@ui/utils/cn';
import { Avatar } from '@ui/media/Avatar';
import { Icon, IconName } from '@ui/media/Icon';
import { Editor } from '@ui/form/Editor/Editor';
import { IconButton } from '@ui/form/IconButton';
import { IconPicker } from '@ui/form/IconPicker';
import { useStore } from '@shared/hooks/useStore';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';

export const DocumentEditor = observer(() => {
  const store = useStore();
  const [params, setParams] = useSearchParams();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'fullscreen' | 'default'>('default');

  const docId = params.get('doc')!;
  const doc = store.documents.getById(docId);
  const isFullscreen = viewMode === 'fullscreen';

  const closeEditor = () => {
    setParams((prev) => {
      prev.delete('doc');

      return prev;
    });
  };

  const Wrapper = useCallback(
    ({ children }: { children: React.ReactNode }) => {
      return viewMode === 'fullscreen' ? (
        <Portal
          container={document.getElementById('organization-profile-main')}
        >
          {children}
        </Portal>
      ) : (
        children
      );
    },
    [viewMode],
  );

  const [_ring, bg, iconColor] = plmMap['grayModern'];

  return (
    <Wrapper>
      <div
        className={cn(
          'relative w-full h-full bg-white',
          isFullscreen && 'absolute top-0 left-0 bottom-0 right-0 z-10',
        )}
      >
        <div className='relative bg-white h-full w-[41rem] mx-auto pt-2'>
          <div className='flex items-center w-full justify-between mb-3'>
            <Popover open={showIconPicker} onOpenChange={setShowIconPicker}>
              <PopoverTrigger className={'group'}>
                {'edit-04' && (
                  <div
                    className={cn(
                      'flex items-center rounded-md p-[5px] bg-grayModern-100',
                      bg,
                      {
                        [bg?.replace('group-hover:', '')]: showIconPicker,
                      },
                    )}
                  >
                    <Icon
                      name={'edit-04' as IconName}
                      className={cn('size-5', iconColor, {
                        [iconColor?.replace('group-hover:', '')]:
                          showIconPicker,
                      })}
                    />
                  </div>
                )}
              </PopoverTrigger>

              <PopoverContent
                align='start'
                className='p-4 bg-grayModern-700 border-0'
              >
                <IconPicker
                  iconOptions={[]}
                  icon={'activity'}
                  color='grayModern'
                  colorsMap={colorMap}
                  iconSearchValue={''}
                  onIconSearch={() => {}}
                  onIconChange={() => {}}
                  onColorChange={() => {}}
                />
              </PopoverContent>
            </Popover>

            <div className='flex items-center gap-1'>
              <IconButton
                size='xs'
                variant='ghost'
                aria-label='toggle view mode'
                icon={
                  <Icon
                    name={viewMode === 'default' ? 'expand-01' : 'collapse-01'}
                  />
                }
                onClick={() =>
                  setViewMode((prev) =>
                    prev === 'default' ? 'fullscreen' : 'default',
                  )
                }
              />

              <IconButton
                size='xs'
                variant='ghost'
                onClick={closeEditor}
                icon={<Icon name='x' />}
                aria-label='close document'
              />
            </div>
          </div>

          <div className='w-full flex gap-4 items-center justify-between mb-4'>
            <div className='flex items-center gap-1'>
              <h1 className='text-lg font-medium line-clamp-1'>
                {doc?.value.name}
              </h1>
              <Menu>
                <MenuButton asChild>
                  <IconButton
                    size='xs'
                    variant='ghost'
                    aria-label='more actions'
                    icon={<Icon name='dots-vertical' />}
                  />
                </MenuButton>
                <MenuList align='start'>
                  <MenuItem className='group/rename'>
                    <Icon
                      name='edit-03'
                      className='text-grayModern-500 group-hover/rename:text-grayModern-700'
                    />{' '}
                    Rename
                  </MenuItem>
                  <MenuItem className='group/archive'>
                    <Icon
                      name='archive'
                      className='text-grayModern-500 group-hover/archive:text-grayModern-700'
                    />{' '}
                    Archive
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>

            <div className='flex items-center gap-2'>
              <Avatar size='xs' name='Alex Calinica' variant='outlineCircle' />
              <span className='text-sm text-nowrap text-grayModern-500'>
                created 12 Jan 2025
              </span>
            </div>
          </div>

          <Editor
            useYjs
            documentId={doc?.value.id}
            namespace='organization-document-editor'
          />
        </div>
      </div>
    </Wrapper>
  );
});

const colorMap = {
  grayModern: 'bg-grayModern-400 ring-grayModern-400',
  error: 'bg-error-400 ring-error-400',
  warning: 'bg-warning-400 ring-warning-400',
  success: 'bg-success-400 ring-success-400',
  grayWarm: 'bg-grayWarm-400 ring-grayWarm-400',
  moss: 'bg-moss-400 ring-moss-400',
  blueLight: 'bg-blueLight-400 ring-blueLight-400',
  indigo: 'bg-indigo-400 ring-indigo-400',
  violet: 'bg-violet-400 ring-violet-400',
  pink: 'bg-pink-400 ring-pink-400',
};

const plmMap = {
  grayModern: [
    'hover:ring-grayModern-400',
    'group-hover:bg-grayModern-50',
    'group-hover:text-grayModern-500',
  ],
  error: [
    'hover:ring-error-400',
    'group-hover:bg-error-50',
    'group-hover:text-error-500',
  ],
  warning: [
    'hover:ring-warning-400',
    'group-hover:bg-warning-50',
    'group-hover:text-warning-500',
  ],
  success: [
    'hover:ring-success-400',
    'group-hover:bg-success-50',
    'group-hover:text-success-500',
  ],
  grayWarm: [
    'hover:ring-grayWarm-400',
    'group-hover:bg-grayWarm-50',
    'group-hover:text-grayWarm-500',
  ],
  moss: [
    'hover:ring-moss-400',
    'group-hover:bg-moss-50',
    'group-hover:text-moss-500',
  ],
  blueLight: [
    'hover:ring-blueLight-400',
    'group-hover:bg-blueLight-50',
    'group-hover:text-blueLight-500',
  ],
  indigo: [
    'hover:ring-indigo-400',
    'group-hover:bg-indigo-50',
    'group-hover:text-indigo-500',
  ],
  violet: [
    'hover:ring-violet-400',
    'group-hover:bg-violet-50',
    'group-hover:text-violet-500',
  ],
  pink: [
    'hover:ring-pink-400',
    'group-hover:bg-pink-50',
    'group-hover:text-pink-500',
  ],
};
