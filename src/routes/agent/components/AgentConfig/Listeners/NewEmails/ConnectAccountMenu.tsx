import { useNavigate } from 'react-router-dom';
import { useRef, useState, ReactNode, useEffect, useCallback } from 'react';

import { observer } from 'mobx-react-lite';
import { NewEmailsUsecase } from '@domain/usecases/agents/listeners/new-emails.usecase';

import { Icon } from '@ui/media/Icon';
import { Combobox } from '@ui/form/Combobox';
import { Google } from '@ui/media/logos/Google';
import { useStore } from '@shared/hooks/useStore';
import { Microsoft } from '@ui/media/icons/Microsoft';
import logoCustomerOs from '@shared/assets/customer-os-small.png';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';

export const ConnectAccountMenu = observer(
  ({
    children,
    usecase,
  }: {
    children: ReactNode;
    usecase: NewEmailsUsecase;
  }) => {
    const [isMailboxPopoverOpen, setIsMailboxPopoverOpen] = useState(false);
    const store = useStore();
    const navigate = useNavigate();
    const iconPickerTriggerRef = useRef<HTMLButtonElement>(null);
    const shouldOpenIconPickerRef = useRef(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const currentUser = store.users
      .toArray()
      .find((e) =>
        e.value.emails?.some((d) =>
          d.email?.includes(store.session.value.profile.email ?? ''),
        ),
      );

    useEffect(() => {
      if (shouldOpenIconPickerRef.current && !menuOpen) {
        shouldOpenIconPickerRef.current = false;

        const timer = setTimeout(() => {
          setIsMailboxPopoverOpen(true);
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [menuOpen]);

    const userMailboxes = store.mailboxes.toArray().filter((mailbox) => {
      if (mailbox.value.userId !== currentUser?.value.id) {
        return false;
      }

      const mailboxAddress = mailbox.value.mailbox;

      return !usecase.emails.some((item) => item.email === mailboxAddress);
    });

    const handleMailboxPopoverOpen = useCallback(() => {
      shouldOpenIconPickerRef.current = true;
      setMenuOpen(false);
    }, []);

    return (
      <div className='flex items-center'>
        <Menu open={menuOpen} onOpenChange={setMenuOpen}>
          <MenuButton asChild>{children}</MenuButton>
          <MenuList align='center' className='w-[230px]'>
            <MenuItem
              className='text-sm'
              onClick={() =>
                store.settings.oauthToken.enableSync('PERSONAL', 'google')
              }
            >
              <Google />
              Google Workspace
            </MenuItem>
            <MenuItem
              className='text-sm'
              onClick={() =>
                store.settings.oauthToken.enableSync('PERSONAL', 'azure-ad')
              }
            >
              <Microsoft />
              Microsoft Outlook
            </MenuItem>

            <MenuItem
              className='text-sm'
              onClick={() =>
                userMailboxes.length
                  ? handleMailboxPopoverOpen()
                  : navigate('/settings?tab=mailboxes&view=buy')
              }
            >
              {userMailboxes.length ? (
                <img
                  width={16}
                  height={16}
                  alt='CustomerOS'
                  src={logoCustomerOs}
                />
              ) : (
                <Icon name={'plus'} />
              )}

              {userMailboxes.length
                ? 'CustomerOS mailboxes'
                : 'Buy new mailboxes'}
            </MenuItem>
          </MenuList>
        </Menu>
        <Popover
          open={isMailboxPopoverOpen}
          onOpenChange={setIsMailboxPopoverOpen}
        >
          <PopoverTrigger asChild ref={iconPickerTriggerRef}>
            <div className='w-[1px] h-4' />
          </PopoverTrigger>
          <PopoverContent
            align='end'
            className='min-w-[264px] max-w-[320px] overflow-auto z-[99999]'
          >
            <Combobox
              options={userMailboxes.map((e) => ({
                label: e.value.mailbox,
                value: e.value.mailbox,
              }))}
              onChange={({ value }) => {
                usecase.addLink(value);
                usecase.execute();
                setIsMailboxPopoverOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
