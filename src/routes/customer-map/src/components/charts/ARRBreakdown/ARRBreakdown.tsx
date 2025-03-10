import { observer } from 'mobx-react-lite';
import ParentSize from '@visx/responsive/lib/components/ParentSize';

import { cn } from '@ui/utils/cn';
import { Skeleton } from '@ui/feedback/Skeleton';
import { useStore } from '@shared/hooks/useStore';
import { getGraphQLClient } from '@shared/util/getGraphQLClient';
import { formatCurrency } from '@utils/getFormattedCurrencyNumber';

import { HelpContent } from './HelpContent';
import { ChartCard } from '../../ChartCard';
import { PercentageTrend } from '../../PercentageTrend';
import ARRBreakdownChart, { ARRBreakdownDatum } from './ARRBreakdown.chart';
import { useArrBreakdownQuery } from '../../../graphql/arrBreakdown.generated';

export const ARRBreakdown = observer(() => {
  const store = useStore();
  const client = getGraphQLClient();
  const { data, isLoading } = useArrBreakdownQuery(client);

  const hasContracts = store.globalCache?.value?.contractsExist ?? false;
  const chartData = (data?.dashboard_ARRBreakdown?.perMonth ?? []).map((d) => ({
    month: d?.month,
    upsells: d?.upsells,
    renewals: d?.renewals,
    newlyContracted: d?.newlyContracted,
    churned: d?.churned,
    cancellations: d?.cancellations,
    downgrades: d?.downgrades,
  })) as ARRBreakdownDatum[];

  const stat = formatCurrency(data?.dashboard_ARRBreakdown?.arrBreakdown ?? 0);
  const percentage = data?.dashboard_ARRBreakdown?.increasePercentage ?? '0';

  return (
    <ChartCard
      stat={stat}
      className='flex-3'
      title='ARR breakdown'
      hasData={hasContracts}
      renderHelpContent={HelpContent}
      renderSubStat={() => <PercentageTrend percentage={percentage} />}
    >
      <ParentSize>
        {({ width }) => {
          return (
            <>
              {isLoading && (
                <Skeleton
                  className={cn(isLoading ? 'h-[200px]' : 'h-full', 'w-full')}
                />
              )}
              <ARRBreakdownChart
                width={width}
                data={chartData}
                hasContracts={hasContracts}
              />
            </>
          );
        }}
      </ParentSize>
    </ChartCard>
  );
});
