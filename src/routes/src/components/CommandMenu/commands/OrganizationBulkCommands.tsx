import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { OrganizationService } from '@domain/services';

import { Tag01 } from '@ui/media/icons/Tag01';
import { User01 } from '@ui/media/icons/User01';
import { Copy07 } from '@ui/media/icons/Copy07';
import { Archive } from '@ui/media/icons/Archive';
import { useStore } from '@shared/hooks/useStore';
import { OrganizationStage } from '@graphql/types';
import { Delete } from '@ui/media/icons/Delete.tsx';
import { Activity } from '@ui/media/icons/Activity';
import { Columns03 } from '@ui/media/icons/Columns03';
import { ArrowBlockUp } from '@ui/media/icons/ArrowBlockUp.tsx';
import { CoinsStacked01 } from '@ui/media/icons/CoinsStacked01';
import { Kbd, CommandKbd, CommandItem } from '@ui/overlay/CommandMenu';
import {
  CommandsContainer,
  StageSubItemGroup,
} from '@shared/components/CommandMenu/commands/shared';
import {
  organizationKeywords,
  UpdateHealthStatusSubItemGroup,
} from '@shared/components/CommandMenu/commands/organization';

export const OrganizationBulkCommands = observer(() => {
  const store = useStore();
  const selectedIds = store.ui.commandMenu.context.ids;
  const organizationService = useMemo(() => new OrganizationService(), []);

  const label = `${selectedIds?.length} companies`;

  return (
    <CommandsContainer label={label}>
      <>
        <CommandItem
          leftAccessory={<Tag01 />}
          keywords={organizationKeywords.change_or_add_tags}
          onSelect={() => {
            store.ui.commandMenu.setType('ChangeTags');
          }}
          rightAccessory={
            <>
              <Kbd>
                <ArrowBlockUp className='size-3' />
              </Kbd>
              <Kbd>T</Kbd>
            </>
          }
        >
          Change or add tags...
        </CommandItem>

        <CommandItem
          leftAccessory={<Tag01 />}
          keywords={organizationKeywords.change_or_add_tags}
          onSelect={() => {
            organizationService.clearTagsBulk(selectedIds);
            store.ui.commandMenu.setOpen(false);
          }}
        >
          Remove tags
        </CommandItem>

        <CommandItem
          leftAccessory={<Columns03 />}
          keywords={organizationKeywords.change_org_stage}
          onSelect={() => {
            store.ui.commandMenu.setType('ChangeStage');
          }}
        >
          Change org stage...
        </CommandItem>

        <StageSubItemGroup
          selectedIds={selectedIds}
          updateStage={organizationService.setStageBulk}
          closeMenu={() => store.ui.commandMenu.setOpen(false)}
        />

        <CommandItem
          leftAccessory={<Archive />}
          keywords={organizationKeywords.archive_org}
          onSelect={() => {
            store.ui.commandMenu.setType('DeleteConfirmationModal');
          }}
          rightAccessory={
            <>
              <CommandKbd />
              <Kbd>
                <Delete className='size-3' />
              </Kbd>
            </>
          }
        >
          Archive company
        </CommandItem>

        <CommandItem
          leftAccessory={<Copy07 />}
          onSelect={() => {
            store.ui.commandMenu.setType('MergeConfirmationModal');
          }}
        >
          Merge
        </CommandItem>

        <CommandItem
          leftAccessory={<Activity />}
          keywords={organizationKeywords.change_health_status}
          onSelect={() => {
            store.ui.commandMenu.setType('UpdateHealthStatus');
          }}
        >
          Change health status...
        </CommandItem>

        <UpdateHealthStatusSubItemGroup
          selectedIds={selectedIds}
          updateHealth={organizationService.setHealthBulk}
          closeMenu={() => store.ui.commandMenu.setOpen(false)}
        />

        <CommandItem
          leftAccessory={<User01 />}
          keywords={organizationKeywords.assign_owner}
          onSelect={() => {
            store.ui.commandMenu.setType('AssignOwner');
          }}
          rightAccessory={
            <>
              <Kbd>
                <ArrowBlockUp className='size-3' />
              </Kbd>
              <Kbd>O</Kbd>
            </>
          }
        >
          Assign owner...
        </CommandItem>

        <CommandItem
          rightAccessory={<Kbd>O</Kbd>}
          leftAccessory={<CoinsStacked01 />}
          keywords={organizationKeywords.create_new_opportunity}
          onSelect={() => {
            organizationService.setStageBulk(
              selectedIds,
              OrganizationStage.Engaged,
            );
            store.ui.commandMenu.setOpen(false);
          }}
        >
          Create new opportunity
        </CommandItem>

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
