import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { registry } from '@domain/stores/registry';
import { OrganizationService } from '@domain/services';

import { Icon } from '@ui/media/Icon';
import { Delete } from '@ui/media/icons/Delete';
import { useStore } from '@shared/hooks/useStore';
import { OrganizationRelationship } from '@graphql/types';
import { ArrowBlockUp } from '@ui/media/icons/ArrowBlockUp';
import { Kbd, CommandKbd, CommandItem } from '@ui/overlay/CommandMenu';
import { UpdateHealthStatusSubItemGroup } from '@shared/components/CommandMenu/commands/organization';
import { organizationKeywords } from '@shared/components/CommandMenu/commands/organization/keywords.ts';
import {
  CommandsContainer,
  StageSubItemGroup,
} from '@shared/components/CommandMenu/commands/shared';

import { OwnerSubItemGroup } from './shared/OwnerSubItemGroup';
import { AddTagSubItemGroup } from './organization/AddTagSubItemGroup';

// TODO - uncomment keyboard shortcuts when they are implemented
export const OrganizationCommands = observer(() => {
  const store = useStore();
  const selectedIds = store.ui.commandMenu.context.ids;
  const id = (store.ui.commandMenu.context.ids as string[])?.[0];
  const organization = registry.get('organizations').get(id);
  const organizationService = useMemo(() => new OrganizationService(), []);
  const label = `Company - ${organization?.name}`;

  return (
    <CommandsContainer label={label}>
      <>
        <CommandItem
          rightAccessory={<Kbd>C</Kbd>}
          leftAccessory={<Icon name='user-03' />}
          keywords={organizationKeywords.add_contact}
          onSelect={() => {
            store.ui.commandMenu.setType('AddContactsBulk');
          }}
        >
          Add contacts
        </CommandItem>

        <CommandItem
          leftAccessory={<Icon name='tag-01' />}
          keywords={organizationKeywords.change_or_add_tags}
          onSelect={() => {
            store.ui.commandMenu.setType('ChangeTags');
          }}
          rightAccessory={
            <>
              <Kbd>
                <ArrowBlockUp className='text-inherit size-3' />
              </Kbd>
              <Kbd>T</Kbd>
            </>
          }
        >
          Change or add tags...
        </CommandItem>
        <AddTagSubItemGroup />

        {!!organization?.tags?.length && (
          <CommandItem
            keywords={['change', 'add', 'tags', 'update', 'edit']}
            leftAccessory={<Icon name='tag-01' className='size-4' />}
            onSelect={() => {
              const tagCount = organization?.tags?.length ?? 0;

              for (let i = 0; i < tagCount; i++) {
                organization?.tags?.pop();
              }
              store.ui.toastSuccess(
                'All tags were removed',
                'tags-remove-success',
              );

              store.ui.commandMenu.setOpen(false);
            }}
          >
            Remove tags
          </CommandItem>
        )}

        {organization?.relationship === OrganizationRelationship.Prospect && (
          <CommandItem
            leftAccessory={<Icon name='columns-03' />}
            keywords={organizationKeywords.change_org_stage}
            onSelect={() => {
              store.ui.commandMenu.setType('ChangeStage');
            }}
          >
            Change company stage...
          </CommandItem>
        )}
        <StageSubItemGroup
          selectedIds={selectedIds}
          updateStage={organizationService.setStageBulk}
          closeMenu={() => store.ui.commandMenu.setOpen(false)}
        />

        <CommandItem
          leftAccessory={<Icon name='archive' />}
          keywords={organizationKeywords.archive_org}
          onSelect={() => {
            store.ui.commandMenu.setType('DeleteConfirmationModal');
          }}
          rightAccessory={
            <>
              <CommandKbd />
              <Kbd>
                <Delete className='text-inherit size-3' />
              </Kbd>
            </>
          }
        >
          Archive company
        </CommandItem>

        <CommandItem
          rightAccessory={<Kbd className='size-auto h-5 px-1.5'>Space</Kbd>}
          leftAccessory={
            <Icon name={store.ui.showPreviewCard ? 'eye-off' : 'eye'} />
          }
          onSelect={() => {
            store.ui.setShowPreviewCard(!store.ui.showPreviewCard);
            store.ui.commandMenu.setOpen(false);
          }}
        >
          {store.ui.showPreviewCard
            ? 'Hide company preview'
            : 'Preview company'}
        </CommandItem>

        <CommandItem
          leftAccessory={<Icon name='activity' />}
          keywords={organizationKeywords.change_health_status}
          onSelect={() => {
            store.ui.commandMenu.setType('UpdateHealthStatus');
          }}
        >
          Health status...
        </CommandItem>
        <UpdateHealthStatusSubItemGroup
          selectedIds={selectedIds}
          updateHealth={organizationService.setHealthBulk}
          closeMenu={() => store.ui.commandMenu.setOpen(false)}
        />

        <CommandItem
          leftAccessory={<Icon name='user-01' />}
          keywords={organizationKeywords.assign_owner}
          onSelect={() => {
            store.ui.commandMenu.setType('AssignOwner');
          }}
          rightAccessory={
            <>
              <Kbd>
                <ArrowBlockUp className='text-inherit size-3' />
              </Kbd>
              <Kbd>O</Kbd>
            </>
          }
        >
          Assign owner...
        </CommandItem>
        <OwnerSubItemGroup />
        {/*
        <CommandItem
          rightAccessory={<Kbd>O</Kbd>}
          leftAccessory={<Icon name='coins-stacked-01' />}
          keywords={organizationKeywords.create_new_opportunity}
          onSelect={() => {
            store.opportunities.create({
              // @ts-expect-error will be autofixed when opportunity store will use OpportunityDatum
              organization: organization?.value,
              id: organization?.value.id,
              name: `${organization?.value.name}'s opportunity`,
              internalType: InternalType.Nbo,
              externalStage: String(
                store.settings.tenant.value?.opportunityStages[0].value,
              ),
              internalStage: InternalStage.Open,
            });
            store.ui.commandMenu.setOpen(false);
          }}
        >
          Create new opportunity
        </CommandItem> */}

        {/*<CommandItem*/}
        {/*  leftAccessory={<Trophy01 />}*/}
        {/*  onSelect={() => {*/}
        {/*    store.ui.commandMenu.setType('AssignOwner');*/}
        {/*  }}*/}
        {/*>*/}
        {/*  Change onboarding stage*/}
        {/*</CommandItem>*/}
      </>
    </CommandsContainer>
  );
});
