import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { Organization } from '@domain/entities';
import { registry } from '@domain/stores/registry';
import { OrganizationAggregate } from '@domain/aggregates/organization.aggregate';
import { EditLatestOrganizationActive } from '@domain/usecases/command-menu/edit-latest-org.usecase';

import { useStore } from '@shared/hooks/useStore';
import { Command, CommandItem, CommandInput } from '@ui/overlay/CommandMenu';

export const EditLatestOrgActive = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const contact = store.contacts.getById(context.ids?.[0] as string);
  const organizationStore = registry.get('organizations');

  const label = `Contact - ${contact?.name}`;

  const usecase = useMemo(() => new EditLatestOrganizationActive(), []);

  const handleClose = () => {
    store.ui.commandMenu.setOpen(false);
    store.ui.commandMenu.setType('ContactCommands');
  };

  const organizations = organizationStore.toArray();

  if (!contact) return null;

  const handleChangeOrganization = (value: Organization) => {
    if (contact) {
      contact?.draft();
      contact.value.primaryOrganizationName = value.name;
      contact.value.primaryOrganizationId = value.id;
      contact?.commit();
    }

    const organization = organizationStore.get(value.id);

    if (!organization) return;
    const organizationAggregate = new OrganizationAggregate(
      organization,
      store,
    );

    organizationAggregate.addContact(contact);

    handleClose();
  };

  return (
    <Command>
      <CommandInput
        label={label}
        value={usecase.searchTerm}
        placeholder='Change company'
        onValueChange={usecase.setSearchTerm}
        onKeyDownCapture={(e) => {
          if (e.key === ' ') {
            e.stopPropagation();
          }
        }}
      />
      <Command.List>
        {organizations.map((option) => (
          <CommandItem
            key={option.id}
            onSelect={() => handleChangeOrganization(option)}
          >
            {option.name}
          </CommandItem>
        ))}
      </Command.List>
    </Command>
  );
});
