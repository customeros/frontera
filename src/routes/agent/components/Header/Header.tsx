import { Link, useParams } from 'react-router-dom';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { observer } from 'mobx-react-lite';
import { ToggleAgentActiveUsecase } from '@domain/usecases/agents/toggle-agent-active.usecase';

import { cn } from '@ui/utils/cn';
import { Switch } from '@ui/form/Switch';
import { Icon, IconName } from '@ui/media/Icon';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Button } from '@ui/form/Button/Button.tsx';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';

import { IconAndColorPicker } from './components/IconAndColorPicker';

export const Header = observer(() => {
  const store = useStore();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const iconPickerTriggerRef = useRef<HTMLButtonElement>(null);
  const shouldOpenIconPickerRef = useRef(false);

  const { id } = useParams<{ id: string }>();

  const agent = id ? store.agents.getById(id) : null;

  const usecase = useMemo(() => new ToggleAgentActiveUsecase(id ?? ''), [id]);

  useEffect(() => {
    if (shouldOpenIconPickerRef.current && !menuOpen) {
      shouldOpenIconPickerRef.current = false;

      const timer = setTimeout(() => {
        setShowIconPicker(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [menuOpen]);

  const handleIconPickerOpen = useCallback(() => {
    shouldOpenIconPickerRef.current = true;
    setMenuOpen(false);
  }, []);

  if (!id) {
    throw new Error('No id provided');
  }

  if (!agent) {
    return null;
  }

  const [_ring, bg, iconColor] = agent.colorMap;

  const handleOpenCommandMenu = (type: 'RenameAgent' | 'ArchiveAgent') => {
    store.ui.commandMenu.setType(type);
    store.ui.commandMenu.setContext({
      ...store.ui.commandMenu.context,
      ids: [id],
    });
    store.ui.commandMenu.setOpen(true);
  };

  return (
    <div className='w-full border-b border-b-grayModern-200 px-3 py-[6px] flex justify-between items-center'>
      <div className='flex items-center gap-1'>
        <Link
          to='/agents'
          className='text-md font-medium text-grayModern-500 hover:text-grayModern-700 transition-colors'
        >
          Agents
        </Link>
        <Icon name='chevron-right' className='w-4 h-4 text-grayModern-500' />
        <div className='flex items-center gap-1'>
          <Popover open={showIconPicker} onOpenChange={setShowIconPicker}>
            <PopoverTrigger className={'group'} ref={iconPickerTriggerRef}>
              {agent?.value?.icon && (
                <div
                  className={cn(
                    'flex items-center rounded-sm p-0.5 bg-grayModern-100',
                    bg,
                    {
                      [bg?.replace('group-hover:', '')]: showIconPicker,
                    },
                  )}
                >
                  <Icon
                    name={agent.value.icon as IconName}
                    className={cn('size-4', iconColor, {
                      [iconColor?.replace('group-hover:', '')]: showIconPicker,
                    })}
                  />
                </div>
              )}
            </PopoverTrigger>

            <PopoverContent
              align='start'
              className='p-4 bg-grayModern-700 border-0'
            >
              <IconAndColorPicker />
            </PopoverContent>
          </Popover>

          <div className='flex items-center gap-1'>
            <Button
              size='xxs'
              variant='ghost'
              onClick={() => handleOpenCommandMenu('RenameAgent')}
              className='text-md font-medium hover:bg-transparent focus:bg-transparent'
            >
              {agent?.value?.name}
            </Button>
            <Menu open={menuOpen} onOpenChange={setMenuOpen}>
              <MenuButton asChild>
                <IconButton
                  size='xs'
                  variant='ghost'
                  aria-label={'Menu'}
                  icon={<Icon name='dots-vertical' />}
                />
              </MenuButton>
              <MenuList side='bottom' align='start'>
                <MenuItem
                  className='group'
                  onClick={() => handleOpenCommandMenu('RenameAgent')}
                >
                  <Icon
                    name='edit-03'
                    className='text-grayModern-500 group-hover:text-grayModern-700'
                  />
                  Rename
                </MenuItem>

                <MenuItem className='group' onClick={handleIconPickerOpen}>
                  <Icon
                    name='brush-01'
                    className='text-grayModern-500 group-hover:text-grayModern-700'
                  />
                  Change icon
                </MenuItem>
                {/*<MenuItem*/}
                {/*  disabled={true}*/}
                {/*  className='group'*/}
                {/*  onClick={() => {*/}
                {/*    store.ui.commandMenu.setContext({*/}
                {/*      ...store.ui.commandMenu.context,*/}
                {/*      ids: [id],*/}
                {/*    });*/}
                {/*    store.ui.commandMenu.setType('DuplicateAgent');*/}
                {/*    store.ui.commandMenu.setOpen(true);*/}
                {/*  }}*/}
                {/*>*/}
                {/*  <Icon*/}
                {/*    name='layers-two-01'*/}
                {/*    className='text-grayModern-500 group-hover:text-grayModern-700'*/}
                {/*  />*/}
                {/*  Duplicate agent*/}
                {/*</MenuItem>*/}
                <MenuItem
                  className='group'
                  onClick={() => handleOpenCommandMenu('ArchiveAgent')}
                >
                  <Icon
                    name='archive'
                    className='text-grayModern-500 group-hover:text-grayModern-700'
                  />
                  Archive agent
                </MenuItem>
              </MenuList>
            </Menu>
          </div>

          <div className='ml-2 flex items-center'>
            <Switch
              onChange={() => usecase.toggleActive()}
              checked={agent?.value?.isActive ?? false}
            />{' '}
          </div>
        </div>
      </div>
    </div>
  );
});
