import type { Organization } from '@/domain/entities';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { OpportunityStore } from '@store/Opportunities/Opportunity.store.ts';
import { OrganizationAggregate } from '@domain/aggregates/organization.aggregate';

import { Check } from '@ui/media/icons/Check.tsx';
import { useStore } from '@shared/hooks/useStore';
import { User01 } from '@ui/media/icons/User01.tsx';
import { Avatar } from '@ui/media/Avatar/Avatar.tsx';
import { CommandSubItem } from '@ui/overlay/CommandMenu';

export const OwnerSubItemGroup = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const users = store.users.tenantUsers;

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
    .with('Organizations', () =>
      context.ids?.reduce((acc, id) => {
        const record = registry.get('organizations').get(id);

        if (record) acc.push(record);

        return acc;
      }, [] as Organization[]),
    )
    .with(
      'Opportunities',
      () =>
        context.ids?.map((e: string) =>
          store.opportunities.value.get(e),
        ) as OpportunityStore[],
    )
    .with('Organization', () =>
      registry.get('organizations').get((context.ids as string[])?.[0]),
    )
    .otherwise(() => undefined);

  const handleSelect = (userId: string) => {
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
        const record = entity as Organization;

        new OrganizationAggregate(record, store).setOwner(userId);
      })
      .with('Organizations', () => {
        if (!entity) return;
        const records = entity as Organization[];

        records.forEach((record) => {
          new OrganizationAggregate(record, store).setOwner(userId);
        });
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
    <>
      {users.map((user) => (
        <CommandSubItem
          icon={null}
          key={user.id}
          leftLabel='Assign to'
          rightLabel={user.name}
          onSelectAction={() => {
            handleSelect(user.id);
          }}
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
        />
      ))}
    </>
  );
});
