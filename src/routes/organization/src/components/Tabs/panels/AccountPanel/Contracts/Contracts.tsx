import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { registry } from '@domain/stores/registry';
import { OrganizationAggregate } from '@domain/aggregates/organization.aggregate';

import { useStore } from '@shared/hooks/useStore';
import { ContractCard } from '@organization/components/Tabs/panels/AccountPanel/Contract/ContractCard';
import { ARRForecast } from '@organization/components/Tabs/panels/AccountPanel/ARRForecast/ARRForecast.tsx';
import { ContractModalsContextProvider } from '@organization/components/Tabs/panels/AccountPanel/context/ContractModalsContext.tsx';
import { ContractModalStatusContextProvider } from '@organization/components/Tabs/panels/AccountPanel/context/ContractStatusModalsContext.tsx';

export const Contracts = observer(() => {
  const store = useStore();
  const id = useParams()?.id as string;
  const organization = registry.get('organizations').get(id);
  const organizationAggregate = new OrganizationAggregate(organization!, store);
  const contracts = organizationAggregate.contracts;

  return (
    <>
      <ARRForecast
        name={organization?.name || ''}
        currency={contracts?.[0]?.currency || 'USD'}
        arrForecast={organization?.renewalSummaryArrForecast}
        maxArrForecast={organization?.renewalSummaryMaxArrForecast}
        renewalLikelihood={organization?.renewalSummaryRenewalLikelihood}
      />
      {contracts?.map((c) => {
        return (
          <div
            key={`contract-card-${c.metadata.id}`}
            className='flex gap-4 flex-col w-full mb-4'
          >
            <ContractModalStatusContextProvider id={c.metadata.id}>
              <ContractModalsContextProvider id={c.metadata.id}>
                <ContractCard
                  contractId={c.metadata.id}
                  organizationName={organization?.name || ''}
                />
              </ContractModalsContextProvider>
            </ContractModalStatusContextProvider>
          </div>
        );
      })}
    </>
  );
});
