import { observer } from 'mobx-react-lite';
import { registry } from '@domain/stores/registry';

import { Check } from '@ui/media/icons/Check';
import { OrganizationStage } from '@graphql/types';
import { Columns03 } from '@ui/media/icons/Columns03';
import { CommandSubItem } from '@ui/overlay/CommandMenu';
import { organizationKeywords } from '@shared/components/CommandMenu/commands';

export const StageSubItemGroup = observer(
  ({
    selectedIds,
    updateStage,
    closeMenu,
  }: {
    closeMenu: () => void;
    selectedIds: Array<string>;
    updateStage: (ids: Array<string>, stage: OrganizationStage) => void;
  }) => {
    const organizationStore = registry.get('organizations');

    const isSelected = () => {
      if (selectedIds.length > 1) {
        return;
      } else {
        const organization = organizationStore.get(selectedIds[0]);

        return organization?.stage;
      }
    };

    return (
      <>
        <CommandSubItem
          rightLabel='Engaged'
          icon={<Columns03 />}
          leftLabel='Change org stage'
          keywords={organizationKeywords.change_org_stage_to_engaged}
          rightAccessory={
            isSelected() === OrganizationStage.Engaged ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.Engaged);
            closeMenu();
          }}
        />
        <CommandSubItem
          rightLabel='Trial'
          icon={<Columns03 />}
          leftLabel='Change org stage'
          keywords={organizationKeywords.change_org_stage_to_trial}
          rightAccessory={
            isSelected() === OrganizationStage.Trial ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.Trial);
            closeMenu();
          }}
        />

        <CommandSubItem
          icon={<Columns03 />}
          rightLabel='Unqualified'
          leftLabel='Change org stage'
          keywords={organizationKeywords.change_org_stage_to_not_a_fit}
          rightAccessory={
            isSelected() === OrganizationStage.Unqualified ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.Unqualified);
            closeMenu();
          }}
        />
      </>
    );
  },
);
