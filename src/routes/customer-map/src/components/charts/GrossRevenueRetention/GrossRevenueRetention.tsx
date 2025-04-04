import { observer } from 'mobx-react-lite';
import ParentSize from '@visx/responsive/lib/components/ParentSize';

import { Skeleton } from '@ui/feedback/Skeleton';
import { useStore } from '@shared/hooks/useStore';
import { getGraphQLClient } from '@shared/util/getGraphQLClient';

import { HelpContent } from './HelpContent';
import { ChartCard } from '../../ChartCard';
import { PercentageTrend } from '../../PercentageTrend';
import { useGrossRevenueRetentionQuery } from '../../../graphql/grossRevenueRetention.generated';
import GrossRevenueRetentionChart, {
  GrossRevenueRetentionDatum,
} from './GrossRevenueRetention.chart';

export const GrossRevenueRetention = observer(() => {
  const store = useStore();
  const client = getGraphQLClient();
  const { data, isLoading } = useGrossRevenueRetentionQuery(client);

  const hasContracts = store.globalCache?.value?.contractsExist ?? false;
  const chartData = (data?.dashboard_GrossRevenueRetention?.perMonth ?? []).map(
    (d, index, arr) => {
      const decIndex = arr.findIndex((d) => d?.month === 12);

      return {
        month: d?.month,
        value: d?.percentage,
        index: decIndex > index - 1 ? 1 : 2,
      };
    },
  ) as GrossRevenueRetentionDatum[];
  const hasMissingData = chartData.every(
    (d) => d.value === 0 || d.value === 100,
  );

  const stat = `${
    data?.dashboard_GrossRevenueRetention?.grossRevenueRetention ?? 0
  }%`;

  const percentage =
    data?.dashboard_GrossRevenueRetention?.increasePercentage ?? '0';

  return (
    <ChartCard
      className='flex-2'
      hasData={hasContracts}
      title='Gross Revenue Retention'
      renderHelpContent={HelpContent}
      stat={hasMissingData ? undefined : stat}
      renderSubStat={
        hasMissingData
          ? () => (
              <p className='font-semibold text-grayModern-400 mb-10'>
                Key data missing.
              </p>
            )
          : () => <PercentageTrend percentage={percentage} />
      }
    >
      <ParentSize>
        {({ width }) => {
          return (
            <>
              {isLoading && <Skeleton className='w-full h-[200px]' />}

              <GrossRevenueRetentionChart
                width={width}
                data={chartData}
                hasContracts={hasMissingData ? false : hasContracts}
              />
            </>
          );
        }}
      </ParentSize>
    </ChartCard>
  );
});
