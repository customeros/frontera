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
          rightLabel='Target'
          icon={<Columns03 />}
          leftLabel='Change lead stage'
          keywords={organizationKeywords.change_org_stage_to_target}
          rightAccessory={
            isSelected() === OrganizationStage.Target ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.Target);
            closeMenu();
          }}
        />
        <CommandSubItem
          icon={<Columns03 />}
          rightLabel='Education'
          leftLabel='Change lead stage'
          keywords={organizationKeywords.change_org_stage_to_education}
          rightAccessory={
            isSelected() === OrganizationStage.Education ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.Education);
            closeMenu();
          }}
        />

        <CommandSubItem
          icon={<Columns03 />}
          rightLabel='Solution'
          leftLabel='Change lead stage'
          keywords={organizationKeywords.change_org_stage_to_solution}
          rightAccessory={
            isSelected() === OrganizationStage.Solution ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.Solution);
            closeMenu();
          }}
        />

        <CommandSubItem
          icon={<Columns03 />}
          rightLabel='Evaluation'
          leftLabel='Change lead stage'
          keywords={organizationKeywords.change_org_stage_to_evaluation}
          rightAccessory={
            isSelected() === OrganizationStage.Evaluation ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.Evaluation);
            closeMenu();
          }}
        />

        <CommandSubItem
          icon={<Columns03 />}
          rightLabel='Ready to buy'
          leftLabel='Change lead stage'
          keywords={organizationKeywords.change_org_stage_to_readytobuy}
          rightAccessory={
            isSelected() === OrganizationStage.ReadyToBuy ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.ReadyToBuy);
            closeMenu();
          }}
        />

        <CommandSubItem
          icon={<Columns03 />}
          rightLabel='Opportunity'
          leftLabel='Change lead stage'
          keywords={organizationKeywords.change_org_stage_to_opportunity}
          rightAccessory={
            isSelected() === OrganizationStage.Opportunity ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.Opportunity);
            closeMenu();
          }}
        />

        <CommandSubItem
          icon={<Columns03 />}
          rightLabel='Customer'
          leftLabel='Change lead stage'
          keywords={organizationKeywords.change_org_stage_to_customer}
          rightAccessory={
            isSelected() === OrganizationStage.Customer ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.Customer);
            closeMenu();
          }}
        />

        <CommandSubItem
          icon={<Columns03 />}
          rightLabel='Not a fit'
          leftLabel='Change lead stage'
          keywords={organizationKeywords.change_org_stage_to_not_a_fit}
          rightAccessory={
            isSelected() === OrganizationStage.NotAFit ? <Check /> : null
          }
          onSelectAction={() => {
            updateStage(selectedIds, OrganizationStage.NotAFit);
            closeMenu();
          }}
        />
      </>
    );
  },
);
