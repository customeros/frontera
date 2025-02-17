import { observer } from 'mobx-react-lite';
import ParentSize from '@visx/responsive/lib/components/ParentSize';

import { cn } from '@ui/utils/cn';
import { Skeleton } from '@ui/feedback/Skeleton';
import { useStore } from '@shared/hooks/useStore';
import { getGraphQLClient } from '@shared/util/getGraphQLClient';

import { HelpContent } from './HelpContent';
import { ChartCard } from '../../ChartCard';
import { PercentageTrend } from '../../PercentageTrend';
import TimeToOnboardChart, { TimeToOnboardDatum } from './TimeToOnboard.chart';
import { useTimeToOnboardQuery } from '../../../graphql/timeToOnboard.generated';

export const TimeToOnboard = observer(() => {
  const store = useStore();
  const client = getGraphQLClient();
  const { data, isLoading } = useTimeToOnboardQuery(client);

  const hasContracts = store.globalCache?.value?.contractsExist ?? false;
  const chartData = (data?.dashboard_TimeToOnboard?.perMonth ?? []).map(
    (d, index, arr) => {
      const decIndex = arr.findIndex((d) => d.month === 12);

      return {
        month: d?.month,
        value: d?.value,
        index: decIndex > index - 1 ? 1 : 2,
      };
    },
  ) as TimeToOnboardDatum[];

  const statValue = data?.dashboard_TimeToOnboard?.timeToOnboard ?? 0;
  const stat = `${statValue} ${statValue === 1 ? 'day' : 'days'}`;
  const percentage = `${
    data?.dashboard_TimeToOnboard?.increasePercentage ?? 0
  }%`;

  return (
    <ChartCard
      stat={stat}
      className='flex-1'
      hasData={hasContracts}
      title='Time to onboard'
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
              <TimeToOnboardChart
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
