import { observer } from 'mobx-react-lite';

import { IconButton } from '@ui/form/IconButton';
import { Archive } from '@ui/media/icons/Archive';
import { useStore } from '@shared/hooks/useStore';
import { DotsVertical } from '@ui/media/icons/DotsVertical';
import { useDisclosure } from '@ui/utils/hooks/useDisclosure';
import { LinkedinOutline } from '@ui/media/icons/LinkedinOutline';
import { SwitchHorizontal02 } from '@ui/media/icons/SwitchHorizontal02';
import { Menu, MenuList, MenuItem, MenuButton } from '@ui/overlay/Menu/Menu';

import { ChangeContactOrganizationModal } from './ChangeContactOrganizationModal';

interface ContactCardMenuProps {
  contactId: string;
}

export const ContactCardMenu = observer(
  ({ contactId }: ContactCardMenuProps) => {
    const store = useStore();
    const { open, onOpen, onClose } = useDisclosure();
    const contactStore = store.contacts.value.get(contactId);

    const linkedInProfile = contactStore?.value.linkedInUrl;

    return (
      <>
        <Menu>
          <MenuButton asChild>
            <IconButton
              size='xxs'
              variant='ghost'
              aria-label='More options'
              className='group-hover/card:opacity-100 opacity-0'
              icon={<DotsVertical className='text-grayModern-500' />}
            />
          </MenuButton>
          <MenuList>
            {linkedInProfile && (
              <MenuItem
                className='group/linkedin'
                onClick={() =>
                  window.open(linkedInProfile ?? '', '_blank', 'noopener')
                }
              >
                <div>
                  <LinkedinOutline className='mr-2 text-grayModern-500 group-hover/linkedingrayModernt-grayModern-700' />
                  <span>Go to LinkedIn profile</span>
                </div>
              </MenuItem>
            )}

            <MenuItem className='group/change' onClick={() => onOpen()}>
              <div>
                <SwitchHorizontal02 className='mr-2 text-grayModern-500 group-hover/changegrayModernt-grayModern-700' />
                <span>Change company</span>
              </div>
            </MenuItem>
            <MenuItem
              className='group/archive'
              onClick={() => store.contacts.archive([contactId])}
            >
              <div>
                <Archive className='mr-2 text-grayModern-500 group-hover/archivegrayModernt-grayModern-700 ' />
                <span>Archive contact</span>
              </div>
            </MenuItem>
          </MenuList>
        </Menu>
        <ChangeContactOrganizationModal
          open={open}
          onClose={onClose}
          contactId={contactId}
        />
      </>
    );
  },
);
