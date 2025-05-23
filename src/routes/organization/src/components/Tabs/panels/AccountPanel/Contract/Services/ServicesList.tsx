import { Fragment } from 'react';

import { observer } from 'mobx-react-lite';
import { ContractStore } from '@store/Contracts/Contract.store.ts';

import { useStore } from '@shared/hooks/useStore';
import { PauseCircle } from '@ui/media/icons/PauseCircle.tsx';
import { BilledType, ContractStatus, ServiceLineItem } from '@graphql/types';
import { groupServicesByParentId } from '@organization/components/Tabs/panels/AccountPanel/Contract/Services/utils.ts';

function getBilledTypeLabel(billedType: BilledType): string {
  switch (billedType) {
    case BilledType.Annually:
      return '/year';
    case BilledType.Monthly:
      return '/month';
    case BilledType.None:
      return '';
    case BilledType.Once:
      return '';
    case BilledType.Usage:
      return '/use';
    case BilledType.Quarterly:
      return '/quarter';
    default:
      return '';
  }
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const ServiceItem = observer(
  ({
    onOpen,
    currency,
    isPaused,
    id,
  }: {
    id: string;
    isPaused?: boolean;
    currency?: string | null;
    onOpen: (props: ServiceLineItem) => void;
  }) => {
    const store = useStore();
    const contractLineItem = store.contractLineItems?.value.get(id)?.value;
    const sku = contractLineItem?.skuId
      ? store.skus.getById(contractLineItem.skuId)
      : null;

    const price =
      typeof contractLineItem?.price === 'string'
        ? parseFloat((contractLineItem.price as string).replace(/,/g, ''))
        : contractLineItem?.price;

    return (
      <>
        <div
          onClick={() => onOpen(contractLineItem as ServiceLineItem)}
          className='flex w-full justify-between cursor-pointer text-sm focus:outline-none'
        >
          <p>{sku?.value?.name || contractLineItem?.description}</p>
          <div className='flex justify-between'>
            <p>
              {![BilledType.Usage, BilledType.None].includes(
                contractLineItem?.billingCycle as BilledType,
              ) && (
                <>
                  {contractLineItem?.quantity}
                  <span className='text-sm mx-1'>×</span>
                </>
              )}

              {formatCurrency(price ?? 0, currency || 'USD')}
              {getBilledTypeLabel(contractLineItem?.billingCycle as BilledType)}
              {isPaused && (
                <PauseCircle className='ml-2 text-grayModern-500 size-4' />
              )}
            </p>
          </div>
        </div>
      </>
    );
  },
);

interface ServicesListProps {
  id: string;
  onModalOpen: () => void;
  currency?: string | null;
}

export const ServicesList = observer(
  ({ currency, onModalOpen, id }: ServicesListProps) => {
    const store = useStore();
    const contractStore = store.contracts.value.get(id) as ContractStore;
    const data = contractStore?.contractLineItems
      ?.map((e) => e.value)
      ?.filter((e) => !e?.metadata?.id?.includes('new'));
    const groupedServicesByParentId = groupServicesByParentId(data);

    return (
      <div className='w-full flex flex-col gap-1 mt-2'>
        {groupedServicesByParentId?.subscription?.length > 0 &&
          contractStore.value.contractStatus !== ContractStatus.Ended && (
            <article className='mb-1'>
              <h1
                tabIndex={0}
                role='button'
                onClick={onModalOpen}
                className='font-medium text-sm mb-1'
                data-test='account-panel-contract-subscription'
              >
                Current subscriptions
              </h1>
              {groupedServicesByParentId?.subscription
                ?.sort((a, b) => {
                  const aDate = new Date(
                    a.currentLineItem?.serviceStarted || 0,
                  );
                  const bDate = new Date(
                    b.currentLineItem?.serviceStarted || 0,
                  );

                  if (aDate.getTime() !== bDate.getTime()) {
                    return bDate.getTime() - aDate.getTime();
                  }

                  return (
                    (b.currentLineItem?.price || 0) -
                    (a.currentLineItem?.price || 0)
                  );
                })
                .map((service) => (
                  <Fragment
                    key={`service-item-${service?.currentLineItem?.metadata?.id}`}
                  >
                    <ServiceItem
                      currency={currency}
                      onOpen={onModalOpen}
                      id={service?.currentLineItem?.metadata?.id}
                      isPaused={service?.currentLineItem?.paused}
                    />
                  </Fragment>
                ))}
            </article>
          )}

        {groupedServicesByParentId?.once?.length > 0 &&
          contractStore.value.contractStatus !== ContractStatus.Ended && (
            <article>
              <h1
                tabIndex={0}
                role='button'
                onClick={onModalOpen}
                className='font-medium text-sm mb-1'
                data-test='account-panel-contract-one-time'
              >
                One-times for next invoice
              </h1>
              {groupedServicesByParentId?.once
                ?.sort((a, b) => {
                  const aDate = new Date(a?.serviceStarted || 0);
                  const bDate = new Date(b?.serviceStarted || 0);

                  if (aDate.getTime() !== bDate.getTime()) {
                    return bDate.getTime() - aDate.getTime();
                  }

                  return (b?.price || 0) - (a?.price || 0);
                })
                .map((service) => (
                  <Fragment key={`service-item-${service?.metadata?.id}`}>
                    <ServiceItem
                      currency={currency}
                      onOpen={onModalOpen}
                      id={service?.metadata?.id}
                    />
                  </Fragment>
                ))}
            </article>
          )}
      </div>
    );
  },
);
