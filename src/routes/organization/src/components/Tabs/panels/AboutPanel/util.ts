import { OrganizationStage } from '@graphql/types';
import { SelectOption } from '@shared/types/SelectOptions';

export const stageOptions: SelectOption<OrganizationStage>[] = [
  {
    label: 'Target',
    value: OrganizationStage.Target,
  },
  {
    label: 'Education',
    value: OrganizationStage.Education,
  },
  {
    label: 'Solution',
    value: OrganizationStage.Solution,
  },
  {
    label: 'Evaluation',
    value: OrganizationStage.Evaluation,
  },
  {
    label: 'Ready to buy',
    value: OrganizationStage.ReadyToBuy,
  },
  {
    label: 'Opportunity',
    value: OrganizationStage.Opportunity,
  },
  {
    label: 'Customer',
    value: OrganizationStage.Customer,
  },
  {
    label: 'Not a fit',
    value: OrganizationStage.NotAFit,
  },
];
