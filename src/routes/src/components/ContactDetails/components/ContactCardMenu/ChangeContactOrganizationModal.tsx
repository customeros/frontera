import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { OrganizationAggregate } from '@domain/aggregates/organization.aggregate';

import { Combobox } from '@ui/form/Combobox';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalPortal,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
} from '@ui/overlay/Modal';

interface ChangeContactOrganizationModalProps {
  open: boolean;
  contactId: string;
  onClose: () => void;
}

export const ChangeContactOrganizationModal = observer(
  ({ onClose, open, contactId }: ChangeContactOrganizationModalProps) => {
    const store = useStore();
    const organizationStore = registry.get('organizations');

    const contactStore = store.contacts.value.get(contactId);

    if (!contactStore) return null;

    return (
      <Modal open={open}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <p className='font-medium'>{`Change ${contactStore?.name}'s company`}</p>
              <ModalCloseButton asChild />
            </ModalHeader>
            <ModalBody>
              <div>
                <p>
                  Changing this contact’s company will associate them with the
                  newly selected company.
                </p>
              </div>

              <Popover modal>
                <PopoverTrigger className='w-full flex items-start justify-start mt-4 text-grayModern-400'>
                  <p className='text-start w-full'>Contact's new company</p>
                </PopoverTrigger>
                <PopoverContent
                  align='center'
                  className='min-w-[264px] max-w-[320px] overflow-auto z-[99999]'
                >
                  <Combobox
                    options={Array.from(organizationStore.cache).map(
                      ([_, v]) => ({
                        label: v.name,
                        value: v.id,
                      }),
                    )}
                    onChange={(value) => {
                      contactStore?.draft();
                      contactStore.value.primaryOrganizationId = value.value;
                      contactStore?.commit();

                      const organization = organizationStore.get(value.value);

                      if (organization) {
                        new OrganizationAggregate(
                          organization,
                          store,
                        ).addContact(contactStore);
                      }

                      onClose();
                    }}
                  />
                </PopoverContent>
              </Popover>
            </ModalBody>
            <ModalFooter className='flex gap-4'>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => onClose()}
              >
                Cancel
              </Button>
              <Button className='w-full' colorScheme='primary'>
                Change company
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalPortal>
      </Modal>
    );
  },
);
