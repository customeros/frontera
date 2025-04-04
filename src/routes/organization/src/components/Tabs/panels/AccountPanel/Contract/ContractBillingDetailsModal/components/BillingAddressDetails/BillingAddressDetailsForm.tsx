import { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { ContractStore } from '@store/Contracts/Contract.store.ts';

import { Input } from '@ui/form/Input';
import { Select } from '@ui/form/Select';
import { useStore } from '@shared/hooks/useStore';
import { countryOptions } from '@shared/util/countryOptions.ts';
import { EmailsInputGroup } from '@organization/components/Tabs/panels/AccountPanel/Contract/ContractBillingDetailsModal/components/EmailsInputGroup/EmailsInputGroup.tsx';

interface BillingAddressDetailsForm {
  contractId: string;
}

export const BillingDetailsForm: FC<BillingAddressDetailsForm> = observer(
  ({ contractId }) => {
    const store = useStore();
    // const cashflowGuardianAgent = store.agents.getFirstAgentByType(
    //   AgentType.CashflowGuardian,
    // );

    const contractStore = store.contracts.value.get(
      contractId,
    ) as ContractStore;

    const handleUpdateBillingDetails = (key: string, value: string) => {
      contractStore?.updateTemp((contract) => ({
        ...contract,
        billingDetails: {
          ...contract.billingDetails,
          [key]: value,
        },
      }));
    };

    return (
      <div className='flex flex-col mt-2'>
        <label className='text-sm font-medium'>
          Organization legal name (required)
          <Input
            size='sm'
            autoComplete='off'
            name='organizationLegalName'
            placeholder='Organization legal name'
            className='overflow-hidden overflow-ellipsis mb-2 font-normal'
            value={
              contractStore?.tempValue?.billingDetails?.organizationLegalName ||
              ''
            }
            onChange={(e) => {
              handleUpdateBillingDetails(
                'organizationLegalName',
                e.target.value,
              );
            }}
          />
        </label>

        <div className='flex flex-col'>
          <p className='text-sm font-medium'>Billing address</p>
          <Select
            size='sm'
            isSearchable
            name='country'
            placeholder='Country'
            options={countryOptions}
            onKeyDown={(e) => e.stopPropagation()}
            dataTest='contract-billing-details-address-country'
            onChange={(newValue) =>
              handleUpdateBillingDetails('country', newValue?.value)
            }
            value={countryOptions.find(
              (e) =>
                e.value === contractStore?.tempValue?.billingDetails?.country,
            )}
          />
          <Input
            size='sm'
            autoComplete='off'
            name='addressLine1'
            placeholder='Address line 1'
            className='overflow-hidden overflow-ellipsis'
            value={contractStore?.tempValue?.billingDetails?.addressLine1 ?? ''}
            onChange={(e) => {
              handleUpdateBillingDetails('addressLine1', e.target.value);
            }}
          />
          <Input
            size='sm'
            autoComplete='off'
            name='addressLine2'
            placeholder='Address line 2'
            className='overflow-hidden overflow-ellipsis'
            value={contractStore?.tempValue?.billingDetails?.addressLine2 ?? ''}
            onChange={(e) => {
              handleUpdateBillingDetails('addressLine2', e.target.value);
            }}
          />
          {contractStore?.tempValue?.billingDetails?.country === 'US' && (
            <Input
              size='sm'
              name='locality'
              placeholder='City'
              autoComplete='off'
              className='overflow-hidden overflow-ellipsis'
              value={contractStore?.tempValue?.billingDetails?.locality ?? ''}
              onChange={(e) => {
                handleUpdateBillingDetails('locality', e.target.value);
              }}
            />
          )}
          <div className='flex'>
            {contractStore?.tempValue?.billingDetails?.country === 'US' ? (
              <Input
                size='sm'
                name='region'
                placeholder='State'
                value={contractStore?.tempValue?.billingDetails?.region ?? ''}
                onChange={(e) => {
                  handleUpdateBillingDetails('region', e.target.value);
                }}
              />
            ) : (
              <Input
                size='sm'
                placeholder='City'
                autoComplete='off'
                className='overflow-hidden overflow-ellipsis'
                value={contractStore?.tempValue?.billingDetails?.locality ?? ''}
                onChange={(e) => {
                  handleUpdateBillingDetails('locality', e.target.value);
                }}
              />
            )}
            <Input
              size='sm'
              name='postalCode'
              autoComplete='off'
              placeholder='ZIP/Postal code'
              className='overflow-hidden overflow-ellipsis'
              value={contractStore?.tempValue?.billingDetails?.postalCode ?? ''}
              onChange={(e) => {
                handleUpdateBillingDetails('postalCode', e.target.value);
              }}
            />
          </div>
        </div>

        <EmailsInputGroup contractId={contractId} />
      </div>
    );
  },
);
