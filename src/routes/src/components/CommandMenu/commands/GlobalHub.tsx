import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { useStore } from '@shared/hooks/useStore';
import { ArrowNarrowRight } from '@ui/media/icons/ArrowNarrowRight';
import {
  Kbd,
  Command,
  CommandItem,
  CommandInput,
} from '@ui/overlay/CommandMenu';
import { GlobalSearchResultNavigationCommands } from '@shared/components/CommandMenu/commands/shared/GlobalSearchResultNavigationCommands.tsx';

export const GlobalHub = () => {
  return (
    <Command>
      <CommandInput
        placeholder='Type a command or search'
        onKeyDownCapture={(e) => {
          if (e.key === ' ') {
            e.stopPropagation();
          }
        }}
      />

      <Command.List>
        <GlobalSearchResultNavigationCommands />
        <Command.Group heading='Navigate'>
          <GlobalSharedCommands />
        </Command.Group>
      </Command.List>
    </Command>
  );
};

interface GlobalSharedCommandsProps {
  dataTest?: string;
}

export const GlobalSharedCommands = observer(
  ({ dataTest }: GlobalSharedCommandsProps) => {
    const store = useStore();
    const navigate = useNavigate();
    const organizationsPreset = store.tableViewDefs.organizationsPreset;
    const contactsPreset = store.tableViewDefs.contactsPreset;

    const handleResync = () => {
      store.ui.purgeLocalData();
      store.ui.commandMenu.setOpen(false);
    };

    const handleGoTo = (path: string, preset?: string) => {
      navigate(path + (preset ? `?preset=${preset}` : ''));
      store.ui.commandMenu.setOpen(false);
    };

    useEffect(() => {
      document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.metaKey && e.key === 'k' && e.shiftKey) {
          store.ui.commandMenu.setType('GlobalHub');
          store.ui.commandMenu.setOpen(true);
        }
      });

      return () => {
        document.removeEventListener('keydown', (e: KeyboardEvent) => {
          if (e.metaKey && e.key === 'k' && e.shiftKey) {
            store.ui.commandMenu.setType('GlobalHub');
            store.ui.commandMenu.setOpen(true);
          }
        });
      };
    }, []);

    return (
      <>
        <CommandItem
          dataTest={`${dataTest}-go`}
          leftAccessory={<ArrowNarrowRight />}
          onSelect={() => handleGoTo('/prospects')}
          keywords={navigationKeywords.go_to_customers}
          rightAccessory={<KeyboardShortcut shortcut='O' />}
        >
          Go to Opportunities
        </CommandItem>

        <CommandItem
          dataTest={`${dataTest}-gc`}
          leftAccessory={<ArrowNarrowRight />}
          keywords={navigationKeywords.go_to_address_book}
          rightAccessory={<KeyboardShortcut shortcut='C' />}
          onSelect={() => handleGoTo('/finder', organizationsPreset)}
        >
          Go to Companies
        </CommandItem>
        <CommandItem
          dataTest={`${dataTest}-gn`}
          leftAccessory={<ArrowNarrowRight />}
          keywords={navigationKeywords.go_to_address_book}
          rightAccessory={<KeyboardShortcut shortcut='N' />}
          onSelect={() => handleGoTo('/finder', contactsPreset)}
        >
          Go to Contacts
        </CommandItem>

        <CommandItem
          dataTest={`${dataTest}-gs`}
          leftAccessory={<ArrowNarrowRight />}
          onSelect={() => handleGoTo('/settings')}
          keywords={navigationKeywords.go_to_opportunities}
          rightAccessory={<KeyboardShortcut shortcut='S' />}
        >
          Go to Settings
        </CommandItem>

        <CommandItem
          onSelect={handleResync}
          keywords={resyncKeywords}
          leftAccessory={<ArrowNarrowRight />}
        >
          Re-sync entire data collection
        </CommandItem>
      </>
    );
  },
);

const KeyboardShortcut = ({ shortcut }: { shortcut: string }) => {
  return (
    <>
      <Kbd className='px-1.5'>G</Kbd>
      <span className='text-grayModern-500 text-[12px]'>then</span>
      <Kbd className='px-1.5'>{shortcut}</Kbd>
    </>
  );
};

const navigationKeywords = {
  go_to_contacts: ['go to', 'contacts', 'navigate', 'people'],
  go_to_customers: ['go to', 'customers', 'navigate'],
  go_to_address_book: ['go to', 'organizations', 'navigate'],
  go_to_opportunities: [
    'go to',
    'opportunities',
    'navigate',
    'deals',
    'pipeline',
  ],
  go_to_scheduled_invoices: [
    'go to',
    'invoices',
    'navigate',
    'past',
    'scheduled',
  ],
  go_to_settings: [
    'go to',
    'settings',
    'navigate',
    'accounts',
    'integrations',
    'apps',
    'emails',
    'billing',
    'data',
  ],
};

const resyncKeywords = ['re-sync', 're sync', 'sync', 'reset'];
