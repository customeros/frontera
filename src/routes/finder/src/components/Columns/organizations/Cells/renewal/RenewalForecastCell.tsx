import { useState, useEffect } from 'react';

import set from 'lodash/set';
import { twMerge } from 'tailwind-merge';
import { observer } from 'mobx-react-lite';
import { registry } from '@domain/stores/registry';
import { PopoverTrigger } from '@radix-ui/react-popover';

import { cn } from '@ui/utils/cn';
import { Edit03 } from '@ui/media/icons/Edit03';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { OpportunityRenewalLikelihood } from '@graphql/types';
import { formatCurrency } from '@utils/getFormattedCurrencyNumber';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@ui/overlay/Popover/Popover';
import {
  RangeSlider,
  RangeSliderThumb,
  RangeSliderTrack,
  RangeSliderFilledTrack,
} from '@ui/form/RangeSlider/RangeSlider';

interface RenewalForecastCellProps {
  id: string;
  amount?: number | null;
  potentialAmount?: number | null;
}

export const RenewalForecastCell = observer(
  ({ id }: RenewalForecastCellProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const organizationStore = registry.get('organizations');
    const organization = organizationStore.get(id);
    const contractCount = organization?.contracts?.length;

    const amount = organization?.renewalSummaryArrForecast ?? null;
    const potentialAmount = organization?.renewalSummaryMaxArrForecast ?? null;

    const initialValue = (() => {
      if (potentialAmount === 0) return 0;

      return ((amount ?? 0) / (potentialAmount ?? 0)) * 100;
    })();

    const [value, setValue] = useState(initialValue);

    const formattedAmount =
      amount !== null && amount >= 0
        ? formatCurrency((potentialAmount ?? 0) * (value / 100), 0)
        : 'Unknown';
    const formattedPotentialAmount = formatCurrency(potentialAmount ?? 0, 0);

    const showPotentialAmount =
      amount !== null &&
      potentialAmount !== null &&
      (potentialAmount ?? 0) * (value / 100) !== potentialAmount;

    const trackStyle = cn('h-0.5 transition-colors', {
      'bg-orangeDark-700': value <= 25,
      'bg-yellow-400': value > 25 && value < 75,
      'bg-greenLight-400': value >= 75,
    });

    const thumbStyle = cn('ring-1 transition-colors shadow-md cursor-pointer', {
      'ring-orangeDark-700': value <= 25,
      'ring-yellow-400': value > 25 && value < 75,
      'ring-greenLight-400': value >= 75,
    });

    const handleChange = (value: number) => {
      const organization = organizationStore.get(id);

      if (!organization) return;

      set(
        organization,
        'accountDetails.renewalSummary.renewalLikelihood',
        (() => {
          if (value <= 25) return OpportunityRenewalLikelihood.LowRenewal;
          if (value > 25 && value < 75)
            return OpportunityRenewalLikelihood.MediumRenewal;

          return OpportunityRenewalLikelihood.HighRenewal;
        })(),
      );
      set(
        organization,
        'accountDetails.renewalSummary.arrForecast',
        (potentialAmount ?? 0) * (value / 100),
      );
    };

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    if (!contractCount) {
      return (
        <span
          className='text-grayModern-400'
          data-test='organization-arr-forecast-in-all-orgs-table'
        >
          No contract
        </span>
      );
    }

    const textColor = amount ? 'text-grayModern-700' : 'text-grayModern-500';

    return (
      <div className='flexjustify-start group/forecast'>
        <Popover open={isEditing} onOpenChange={setIsEditing}>
          <div className='flex gap-1 items-center'>
            <PopoverAnchor>
              <span>
                {showPotentialAmount && (
                  <span className='text-sm text-grayModern-500 line-through mr-1'>
                    {formattedPotentialAmount}
                  </span>
                )}
                <span className={twMerge('text-sm', textColor)}>
                  {formattedAmount}
                </span>
              </span>
            </PopoverAnchor>

            <PopoverTrigger asChild>
              <IconButton
                size='xxs'
                variant='ghost'
                aria-label='edit renewal likelihood'
                icon={<Edit03 className='text-grayModern-500' />}
                className={cn(
                  'rounded-md opacity-0 group-hover/forecast:opacity-100',
                  isEditing && 'opacity-100',
                )}
              />
            </PopoverTrigger>
          </div>

          <PopoverContent align='start' sideOffset={8}>
            <RangeSlider
              min={0}
              step={1}
              max={100}
              value={[value]}
              className='w-40'
              onValueChange={(values) => {
                setValue(values[0]);
              }}
              onValueCommit={(values) => {
                handleChange(values[0]);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setValue(initialValue);
                }
              }}
            >
              <RangeSliderTrack className='bg-grayModern-400 h-0.5'>
                <RangeSliderFilledTrack className={trackStyle} />
              </RangeSliderTrack>
              <RangeSliderThumb className={thumbStyle} />
            </RangeSlider>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
