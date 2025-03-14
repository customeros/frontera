import { FC } from 'react';

import { toZonedTime } from 'date-fns-tz';
import { observer } from 'mobx-react-lite';
import { ContractLineItemStore } from '@store/ContractLineItems/ContractLineItem.store.ts';

import { cn } from '@ui/utils/cn.ts';
import { DateTimeUtils } from '@utils/date.ts';
import { Tag, TagLabel } from '@ui/presentation/Tag';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip.tsx';
import { PauseCircle } from '@ui/media/icons/PauseCircle.tsx';
import { FlipBackward } from '@ui/media/icons/FlipBackward.tsx';
import { IconButton } from '@ui/form/IconButton/IconButton.tsx';
import { currencySymbol } from '@shared/util/currencyOptions.ts';
import {
  BilledType,
  ContractStatus,
  ServiceInvoicingStatus,
} from '@graphql/types';

interface ProductItemProps {
  isEnded?: boolean;
  currency?: string;
  service: ContractLineItemStore;
  allowIndividualRestore?: boolean;
  type: 'subscription' | 'one-time';
  badge?: ServiceInvoicingStatus | null;
  contractStatus?: ContractStatus | null;
}

const badgeMap: Record<
  ServiceInvoicingStatus,
  { label: string; color: 'grayModern' | 'error' | 'primary' }
> = {
  [ServiceInvoicingStatus.Invoiced]: {
    label: 'Invoiced',
    color: 'grayModern',
  },
  [ServiceInvoicingStatus.Void]: {
    label: 'Invoice voided',
    color: 'error',
  },
  [ServiceInvoicingStatus.Ready]: {
    label: 'Ready to invoice',
    color: 'primary',
  },
};

const billedTypeLabel: Record<
  Exclude<BilledType, BilledType.None | BilledType.Usage | BilledType.Once>,
  string
> = {
  [BilledType.Monthly]: 'month',
  [BilledType.Quarterly]: 'quarter',
  [BilledType.Annually]: 'year',
};

const deleteButtonClasses =
  'border-none bg-transparent shadow-none text-grayModern-400 pr-3 pl-4 py-2 -mx-4 absolute -right-7 top-0 bottom-0 invisible group-hover:visible hover:bg-transparent';

export const ProductItemPreview: FC<ProductItemProps> = observer(
  ({
    service,
    isEnded,
    currency,
    type,
    contractStatus,
    allowIndividualRestore,
    badge,
  }) => {
    const sliCurrencySymbol = currency ? currencySymbol?.[currency] : '$';

    const isFutureVersion =
      service?.tempValue?.serviceStarted &&
      DateTimeUtils.isFuture(service?.tempValue?.serviceStarted);

    const isDraft =
      contractStatus &&
      [ContractStatus.Draft, ContractStatus.Scheduled].includes(contractStatus);

    const isCurrentVersion =
      (service?.tempValue?.serviceEnded &&
        DateTimeUtils.isFuture(service?.tempValue?.serviceEnded) &&
        DateTimeUtils.isPast(service?.tempValue?.serviceStarted)) ||
      (!service?.tempValue?.serviceEnded &&
        DateTimeUtils.isPast(service?.tempValue?.serviceStarted));

    return (
      <>
        <div
          className={cn(
            'flex justify-between group text-grayModern-700 relative items-center',
            {
              'text-grayModern-400': isEnded,
              'line-through text-grayModern-400 hovergrayModernt-grayModern-400':
                service.tempValue.closed,
            },
          )}
        >
          <div className='flex items-baseline text-inherit'>
            <span>
              {service?.tempValue?.quantity}
              <span className='relative z-[2] mx-1'>×</span>

              {sliCurrencySymbol}
              {service?.tempValue?.price}
            </span>
            {type !== 'one-time' && <span>/ </span>}
            <span>
              {' '}
              {
                billedTypeLabel[
                  service?.tempValue?.billingCycle as Exclude<
                    BilledType,
                    BilledType.None | BilledType.Usage | BilledType.Once
                  >
                ]
              }{' '}
            </span>

            <span className='ml-1 text-inherit'>
              • {service?.tempValue?.tax?.taxRate}% VAT
            </span>
          </div>
          <div className='flex items-center'>
            {type === 'one-time' && badge && !service.tempValue.closed && (
              <div className=''>
                <Tag
                  size='sm'
                  variant={'subtle'}
                  colorScheme={badgeMap[badge].color}
                >
                  <TagLabel>{badgeMap[badge].label}</TagLabel>
                </Tag>
              </div>
            )}

            <div className='ml-1 text-inherit'>
              {isCurrentVersion && type !== 'one-time' && 'Current since '}

              {service?.tempValue?.serviceStarted &&
                DateTimeUtils.format(
                  toZonedTime(
                    service?.tempValue?.serviceStarted,
                    'UTC',
                  ).toString(),
                  DateTimeUtils.defaultFormatShortString,
                )}
            </div>

            {allowIndividualRestore &&
              (!service?.tempValue?.metadata.id ||
                isDraft ||
                isFutureVersion) &&
              service?.tempValue?.closed && (
                <IconButton
                  size='xs'
                  variant='outline'
                  aria-label={'Restore version'}
                  className={deleteButtonClasses}
                  icon={<FlipBackward className='text-inherit' />}
                  onClick={() =>
                    service.updateTemp((prev) => ({ ...prev, closed: false }))
                  }
                />
              )}

            {service.tempValue.paused && (
              <Tooltip label={'This service will be invoiced when resumed'}>
                <PauseCircle className='text-grayModern-500 size-4 ml-2' />
              </Tooltip>
            )}
          </div>
        </div>
      </>
    );
  },
);
