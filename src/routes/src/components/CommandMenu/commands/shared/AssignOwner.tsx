import { useMemo } from 'react';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { Organization } from '@/domain/entities';
import { registry } from '@/domain/stores/registry';
import { OpportunityStore } from '@store/Opportunities/Opportunity.store.ts';
import { OrganizationService } from '@/domain/services/organization/organizations.service';

import { Check } from '@ui/media/icons/Check.tsx';
import { useStore } from '@shared/hooks/useStore';
import { User01 } from '@ui/media/icons/User01.tsx';
import { Avatar } from '@ui/media/Avatar/Avatar.tsx';
import { Command, CommandItem, CommandInput } from '@ui/overlay/CommandMenu';

export const AssignOwner = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const users = store.users.tenantUsers;
  const organizationStore = registry.get('organizations');
  const organizationService = useMemo(() => new OrganizationService(), []);

  const entity = match(context.entity)
    .returnType<
      | OpportunityStore
      | Organization
      | Organization[]
      | OpportunityStore[]
      | undefined
    >()
    .with('Opportunity', () =>
      store.opportunities.value.get((context.ids as string[])?.[0]),
    )
    .with(
      'Organizations',
      () =>
        context.ids?.map((e: string) =>
          organizationStore.get(e),
        ) as Organization[],
    )
    .with(
      'Opportunities',
      () =>
        context.ids?.map((e: string) =>
          store.opportunities.value.get(e),
        ) as OpportunityStore[],
    )
    .with('Organization', () =>
      organizationStore.get((context.ids as string[])?.[0]),
    )
    .otherwise(() => undefined);
  const label = match(context.entity)
    .with(
      'Opportunity',
      () => `Opportunity - ${(entity as OpportunityStore)?.value?.name}`,
    )
    .with('Organization', () => `Company - ${(entity as Organization)?.name}`)
    .with('Organizations', () => `${context.ids?.length} organizations`)
    .with('Opportunities', () => `${context.ids?.length} opportunities`)
    .otherwise(() => undefined);

  const handleSelect = (userId: string) => () => {
    if (!context.ids?.[0]) return;
    const user = store.users.value.get(userId);

    if (!user) return;

    match(context.entity)
      .with('Opportunity', () => {
        if (!entity) return;
        (entity as OpportunityStore)?.update((value) => {
          if (!value.owner) {
            Object.assign(value, { owner: user.value });

            return value;
          }

          Object.assign(value.owner, user.value);

          return value;
        });
      })
      .with('Organization', () => {
        if (!entity) return;

        organizationService.setOwner(entity as Organization, user.value.id);
      })
      .with('Organizations', () => {
        if (!(entity as Organization[])?.length) return;

        const orgs = entity as Organization[];

        orgs.forEach((o) => {
          organizationService.setOwner(o, user.value.id);
        });

        store.ui.toastSuccess(
          `Owner assigned to ${orgs.length} companies`,
          'owner-update-success',
        );
      })
      .with('Opportunities', () => {
        if (!(entity as OpportunityStore[])?.length) return;
        (entity as OpportunityStore[]).forEach((org) => {
          org.update((value) => {
            if (!value.owner) {
              Object.assign(value, { owner: user.value });

              return value;
            }

            Object.assign(value.owner, user.value);

            return value;
          });
        });
      })
      .otherwise(() => {});

    store.ui.commandMenu.toggle('AssignOwner');
  };

  return (
    <Command label='Pick Owner'>
      <CommandInput label={label} placeholder='Assign owner...' />

      <Command.List>
        {users.map((user) => (
          <CommandItem
            key={user.id}
            onSelect={handleSelect(user.id)}
            rightAccessory={
              user.id ===
              (entity as Organization | OpportunityStore)?.owner?.id ? (
                <Check />
              ) : null
            }
            leftAccessory={
              <Avatar
                size='xs'
                textSize='xxs'
                name={user.name ?? 'Unnamed'}
                className='border border-grayModern-200'
                src={user.value.profilePhotoUrl ?? undefined}
                icon={<User01 className='text-grayModern-500 size-3' />}
              />
            }
          >
            {user.name}
          </CommandItem>
        ))}
      </Command.List>
    </Command>
  );
});
