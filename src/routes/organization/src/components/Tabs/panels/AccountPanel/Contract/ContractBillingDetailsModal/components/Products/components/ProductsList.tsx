import { Fragment } from 'react';

import { observer } from 'mobx-react-lite';
import { ContractStore } from '@store/Contracts/Contract.store';
import { ContractLineItemStore } from '@store/ContractLineItems/ContractLineItem.store';

import { useStore } from '@shared/hooks/useStore';
import { BilledType, ContractStatus, ServiceLineItem } from '@graphql/types';

import { ProductCard } from './ProductCard';

interface ProductListProps {
  id: string;
  currency?: string;
  contractStatus?: ContractStatus | null;
}

export const ProductsList = observer(
  ({ id, currency, contractStatus }: ProductListProps) => {
    const store = useStore();
    const ids = (
      store.contracts.value.get(id) as ContractStore
    )?.tempValue?.contractLineItems?.map((item) => item?.metadata?.id);

    const serviceLineItems =
      ids
        ?.filter((id) => {
          const sli = store.contractLineItems?.value.get(
            id,
          ) as ContractLineItemStore;

          return sli?.value.closed === false;
        })
        ?.map(
          (id) =>
            (store.contractLineItems?.value.get(id) as ContractLineItemStore)
              ?.tempValue,
        )
        .filter((e) => Boolean(e)) || [];

    const groupServices = (services: ServiceLineItem[]) => {
      const { subscription, once } = services.reduce<{
        once: ServiceLineItem[];
        subscription: ServiceLineItem[];
      }>(
        (acc, item) => {
          const key: 'subscription' | 'once' = [
            BilledType.Monthly,
            BilledType.Quarterly,
            BilledType.Annually,
          ].includes(item.billingCycle)
            ? 'subscription'
            : 'once';

          acc[key].push(item);

          return acc;
        },
        { subscription: [], once: [] },
      );

      const groupedSubscriptions: Record<string, ServiceLineItem[]> = {};

      subscription.forEach((service) => {
        const parentId = service?.parentId || service?.metadata?.id;

        if (parentId) {
          if (!groupedSubscriptions[parentId]) {
            groupedSubscriptions[parentId] = [];
          }
          groupedSubscriptions[parentId].push(service);
        }
      });

      // Group one-time items by skuId
      const groupedOnce: Record<string, ServiceLineItem[]> = {};

      once.forEach((service) => {
        const skuId = service?.skuId;

        if (skuId) {
          if (!groupedOnce[skuId]) {
            groupedOnce[skuId] = [];
          }
          groupedOnce[skuId].push(service);
        } else {
          if (!groupedOnce[service.metadata.id]) {
            groupedOnce[service.metadata.id] = [];
          }
          groupedOnce[service.metadata.id].push(service);
        }
      });

      return {
        subscription: Object.values(groupedSubscriptions).map((group) =>
          group.sort(
            (a, b) =>
              new Date(a?.serviceStarted).getTime() -
              new Date(b?.serviceStarted).getTime(),
          ),
        ),
        once: Object.values(groupedOnce).map((group) =>
          group.sort(
            (a, b) =>
              new Date(a?.serviceStarted).getTime() -
              new Date(b?.serviceStarted).getTime(),
          ),
        ),
      };
    };

    const groupedServices = groupServices(
      serviceLineItems as ServiceLineItem[],
    );

    return (
      <div className='flex flex-col'>
        {groupedServices.subscription.length !== 0 && (
          <p className='text-sm font-medium mb-2 mt-1'>Subscriptions</p>
        )}
        {groupedServices.subscription
          .sort((a, b) => {
            const aDate = new Date(a[0]?.serviceStarted || 0);
            const bDate = new Date(b[0]?.serviceStarted || 0);

            const dateComparison = bDate.getTime() - aDate.getTime();

            if (dateComparison === 0) {
              const aTimestamp = new Date(a[0]?.serviceStarted || 0).getTime();
              const bTimestamp = new Date(b[0]?.serviceStarted || 0).getTime();

              return bTimestamp - aTimestamp;
            }

            return dateComparison;
          })
          .map((data) => (
            <Fragment
              key={`subscription-card-item-${data[0]?.skuId}-${data[0]?.metadata.id}-${data[0].description}`}
            >
              <ProductCard
                contractId={id}
                type='subscription'
                currency={currency ?? 'USD'}
                contractStatus={contractStatus}
                ids={data.map((e) => e?.metadata?.id)}
              />
            </Fragment>
          ))}

        {groupedServices.once.length !== 0 && (
          <p className='text-sm font-medium mb-2 mt-1'>One-time</p>
        )}
        {groupedServices.once
          .sort((a, b) => {
            const aDate = new Date(a[0]?.serviceStarted || 0);
            const bDate = new Date(b[0]?.serviceStarted || 0);

            const dateComparison = bDate.getTime() - aDate.getTime();

            if (dateComparison === 0) {
              const aTimestamp = new Date(a[0]?.serviceStarted || 0).getTime();
              const bTimestamp = new Date(b[0]?.serviceStarted || 0).getTime();

              return bTimestamp - aTimestamp;
            }

            return dateComparison;
          })
          .map((data, i) => (
            <Fragment
              key={`one-time-card-item-${data[0]?.skuId}-${data[0]?.metadata.id}-${data[0].description}-${i}`}
            >
              <ProductCard
                contractId={id}
                type='one-time'
                currency={currency ?? 'USD'}
                contractStatus={contractStatus}
                ids={data.map((e) => e?.metadata?.id)}
              />
            </Fragment>
          ))}
      </div>
    );
  },
);
