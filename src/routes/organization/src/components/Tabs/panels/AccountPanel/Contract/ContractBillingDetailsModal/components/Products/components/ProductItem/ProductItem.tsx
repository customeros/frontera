import { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { ContractLineItemStore } from '@store/ContractLineItems/ContractLineItem.store.ts';

import { Input } from '@ui/form/Input';
import { DateTimeUtils } from '@utils/date.ts';
import { ContractStatus, ServiceInvoicingStatus } from '@graphql/types';

import { ProductItemEdit } from './ProductItemEdit.tsx';
import { ProductItemPreview } from './ProductItemPreview.tsx';

interface ServiceItemProps {
  isEnded?: boolean;
  currency?: string;
  dataTest?: string;
  usedDates?: string[];
  isModification?: boolean;
  service: ContractLineItemStore;
  allowIndividualRestore?: boolean;
  type: 'subscription' | 'one-time';
  allServices?: ContractLineItemStore[];
  contractStatus?: ContractStatus | null;
}

export const ProductItem: FC<ServiceItemProps> = observer(
  ({
    service,
    allServices,
    isEnded,
    currency,
    isModification,
    type,
    contractStatus,
    allowIndividualRestore,
  }) => {
    const isFutureVersion =
      (service?.tempValue?.serviceStarted &&
        DateTimeUtils.isFuture(service?.tempValue?.serviceStarted)) ||
      service.value.invoicingStatus === ServiceInvoicingStatus.Ready;

    const isDraft =
      contractStatus &&
      [ContractStatus.Draft, ContractStatus.Scheduled].includes(contractStatus);

    const showEditView =
      (isDraft && !service.tempValue?.closed) ||
      (isFutureVersion && !service.tempValue?.closed) ||
      (!service?.tempValue?.metadata.id && !service?.tempValue?.closed) ||
      (!service?.tempValue?.closed &&
        service?.tempValue?.metadata?.id?.includes('new'));

    const isOneTimeHistory =
      service.value.invoicingStatus !== ServiceInvoicingStatus.Ready &&
      type === 'one-time';

    return (
      <div>
        {showEditView && !isOneTimeHistory ? (
          <ProductItemEdit
            type={type}
            service={service}
            currency={currency}
            allServices={allServices}
            isModification={isModification}
            contractStatus={contractStatus}
          />
        ) : (
          <ProductItemPreview
            type={type}
            service={service}
            isEnded={isEnded}
            currency={currency}
            contractStatus={contractStatus}
            badge={service.tempValue.invoicingStatus}
            allowIndividualRestore={allowIndividualRestore}
          />
        )}

        {type === 'one-time' && !!service.tempValue.skuId && (
          <>
            {!showEditView ? (
              <p className='text-xs text-grayModern-500'>
                {service?.tempValue?.description}
              </p>
            ) : (
              <Input
                size='xxs'
                variant='unstyled'
                className='text-xs text-grayModern-500'
                placeholder='Add an invoice description...'
                defaultValue={service?.tempValue?.description ?? ''}
                onBlur={(e) => {
                  service.updateTemp((prev) => ({
                    ...prev,
                    description: e.target.value ?? '',
                  }));
                }}
              />
            )}
          </>
        )}
      </div>
    );
  },
);
