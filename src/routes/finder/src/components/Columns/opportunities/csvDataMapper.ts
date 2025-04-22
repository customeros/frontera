import { OpportunityStore } from '@store/Opportunities/Opportunity.store';

import { DateTimeUtils } from '@utils/date.ts';
import { ColumnViewType } from '@graphql/types';

export const csvDataMapper = {
  [ColumnViewType.OpportunitiesName]: (d: OpportunityStore) => d?.value?.name,
  [ColumnViewType.OpportunitiesOrganization]: (d: OpportunityStore) =>
    d.organization?.name,
  [ColumnViewType.OpportunitiesStage]: (d: OpportunityStore) =>
    d.externalStage?.label,
  [ColumnViewType.OpportunitiesEstimatedArr]: (d: OpportunityStore) =>
    d.value?.maxAmount,
  [ColumnViewType.OpportunitiesNextStep]: (d: OpportunityStore) =>
    d.value?.nextSteps,

  [ColumnViewType.OpportunitiesOwner]: (d: OpportunityStore) =>
    d?.owner?.value.name,
  [ColumnViewType.OpportunitiesTimeInStage]: (d: OpportunityStore) =>
    d.value.stageLastUpdated
      ? DateTimeUtils.getDifferenceFromNow(d.value.stageLastUpdated)
          ?.join(' ')
          .replace('-', '')
      : 'unknown',
  [ColumnViewType.OpportunitiesCreatedDate]: (d: OpportunityStore) =>
    d?.value?.metadata?.created
      ? DateTimeUtils.format(
          d?.value?.metadata?.created,
          DateTimeUtils.dateWithAbreviatedMonth,
        )
      : 'unknown',
};
