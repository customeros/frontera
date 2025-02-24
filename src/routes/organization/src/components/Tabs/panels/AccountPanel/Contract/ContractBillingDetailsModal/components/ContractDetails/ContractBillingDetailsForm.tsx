import { useMemo } from 'react';

import { toZonedTime } from 'date-fns-tz';
import { observer } from 'mobx-react-lite';
import { Agent } from '@store/Agents/Agent.dto';
import { ContractStore } from '@store/Contracts/Contract.store';

import { Switch } from '@ui/form/Switch';
import { DateTimeUtils } from '@utils/date';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { Radio, RadioGroup } from '@ui/form/Radio';
import { ModalBody } from '@ui/overlay/Modal/Modal';
import { Divider } from '@ui/presentation/Divider/Divider';
import { currencyOptions } from '@shared/util/currencyOptions';
import { DatePickerUnderline } from '@ui/form/DatePicker/DatePickerUnderline';
import {
  Currency,
  AgentType,
  ContractStatus,
  TenantBillingProfile,
} from '@graphql/types';
import {
  paymentDueOptions,
  contractBillingCycleOptions,
} from '@organization/components/Tabs/panels/AccountPanel/utils';
import { Products } from '@organization/components/Tabs/panels/AccountPanel/Contract/ContractBillingDetailsModal/components/Products';

import { InlineSelect } from './InlineSelect';
import { ContractUploader } from './ContractUploader';
import { CommittedPeriodInput } from './CommittedPeriodInput';
import { PaymentDetailsPopover } from './PaymentDetailsPopover';

interface SubscriptionServiceModalProps {
  contractId: string;
  openAddressModal: () => void;
  contractStatus?: ContractStatus | null;
  tenantBillingProfile?: TenantBillingProfile | null;
}

export const ContractBillingDetailsForm = observer(
  ({
    contractId,
    contractStatus,
    openAddressModal,
  }: SubscriptionServiceModalProps) => {
    const store = useStore();
    const contractStore = store.contracts.value.get(
      contractId,
    ) as ContractStore;

    const currency = contractStore?.tempValue?.currency;

    const cashflowAgent = store.agents.getFirstAgentByType(
      AgentType.CashflowGuardian,
    )?.value;

    // TODO when errors are populated on capability level use that instead of using error check from config
    const isStripeEnabled = useMemo(() => {
      const capability = cashflowAgent?.capabilities.find(
        (e) => e.type === 'PROCESS_AUTOPAYMENT',
      );

      if (!capability || !capability.active || !capability.config) return false;

      const processAutopaymentConfig = Agent.parseConfig(capability.config);

      return !processAutopaymentConfig?.stripe?.error;
    }, [cashflowAgent?.capabilities]);

    // TODO when errors are populated on capability level use that instead of using error check from config
    const isBankPaymentEnabled = useMemo(() => {
      const capability = cashflowAgent?.capabilities.find(
        (e) => e.type === 'GENERATE_INVOICE',
      );

      if (!capability || !capability.active || !capability.config) return false;
      const bankPaymentConfig = Agent.parseConfig(capability.config);

      if (!bankPaymentConfig) return false;

      return Object.values(bankPaymentConfig).every(
        (item) => !item?.error?.length,
      );
    }, [cashflowAgent?.capabilities]);
    const renewalCalculatedDate = useMemo(() => {
      if (!contractStore?.tempValue?.serviceStarted) return null;
      const parsed = contractStore?.tempValue?.committedPeriodInMonths
        ? parseFloat(contractStore?.tempValue?.committedPeriodInMonths)
        : 1;

      return DateTimeUtils.addMonth(
        contractStore.tempValue.serviceStarted,
        parsed,
      );
    }, [
      contractStore?.tempValue?.serviceStarted,
      contractStore?.tempValue?.committedPeriodInMonths,
    ]);

    return (
      <ModalBody className='flex flex-col flex-1 p-0'>
        <ul className='mb-2 list-disc ml-5'>
          <li className='text-sm'>
            <div className='flex items-baseline'>
              <CommittedPeriodInput contractId={contractId} />

              <span className='whitespace-nowrap mr-1'>
                contract, starting{' '}
              </span>

              <DatePickerUnderline
                value={contractStore?.tempValue?.serviceStarted}
                onChange={(date) =>
                  contractStore?.updateTemp((prev) => ({
                    ...prev,
                    serviceStarted: date ? date.toISOString() : null,
                  }))
                }
              />
            </div>
          </li>
          <li className='text-sm'>
            <div className='flex items-baseline'>
              Live until{' '}
              {renewalCalculatedDate
                ? DateTimeUtils.format(
                    toZonedTime(renewalCalculatedDate, 'UTC').toUTCString(),
                    DateTimeUtils.dateWithAbreviatedMonth,
                  )
                : '...'}
              ,{' '}
              <Button
                size='sm'
                variant='ghost'
                className='font-normal text-sm p-0 ml-1 relative text-gray-500 hover:bg-transparent focus:bg-transparent underline'
                onClick={() =>
                  contractStore?.updateTemp((prev) => ({
                    ...prev,
                    autoRenew: !contractStore?.tempValue.autoRenew,
                  }))
                }
              >
                {contractStore?.tempValue.autoRenew
                  ? 'auto-renews'
                  : 'not auto-renewing'}
              </Button>
            </div>
          </li>
          <li className='text-sm'>
            <div className='flex items-baseline'>
              <span className='whitespace-nowrap'>Contracting in</span>
              <div className='z-30'>
                <InlineSelect<Currency>
                  label='Currency'
                  value={currency}
                  id='contract-currency'
                  name='contract-currency'
                  options={currencyOptions}
                  placeholder='Invoice currency'
                  onChange={(selectedOption) =>
                    contractStore?.updateTemp((contract) => ({
                      ...contract,
                      currency: selectedOption.value as Currency,
                    }))
                  }
                />
              </div>
            </div>
          </li>
        </ul>
        <Products
          id={contractId}
          contractStatus={contractStatus}
          currency={currency ?? Currency.Usd}
        />
        {cashflowAgent?.isActive && (
          <>
            <div className='flex relative items-center h-8 mb-1'>
              <p className='text-sm text-gray-500 after:border-t-2 w-fit whitespace-nowrap mr-2'>
                Billing policy
              </p>
              <Divider />
            </div>
            <ul className='mb-2 list-disc ml-5'>
              <li className='text-sm'>
                <div className='flex items-baseline'>
                  <span className='whitespace-nowrap mr-1'>
                    Billing starts{' '}
                  </span>

                  <DatePickerUnderline
                    value={
                      contractStore?.tempValue?.billingDetails?.invoicingStarted
                    }
                    onChange={(date) =>
                      contractStore?.updateTemp((prev) => ({
                        ...prev,
                        billingDetails: {
                          ...prev.billingDetails,
                          invoicingStarted: date,
                        },
                      }))
                    }
                  />
                </div>
              </li>
              <li className='text-sm'>
                <div className='flex items-baseline'>
                  <span className='whitespace-nowrap'>Invoices are sent</span>
                  <span className='z-20'>
                    <InlineSelect<number>
                      label='billing period'
                      id='contract-billingCycle'
                      placeholder='billing period'
                      name='contract-billingCycle'
                      options={contractBillingCycleOptions}
                      value={
                        contractStore?.tempValue?.billingDetails
                          ?.billingCycleInMonths
                      }
                      onChange={(selectedOption) =>
                        contractStore?.updateTemp((contract) => ({
                          ...contract,
                          billingDetails: {
                            ...contract.billingDetails,
                            billingCycleInMonths: selectedOption.value,
                          },
                        }))
                      }
                    />
                  </span>
                  <span className='whitespace-nowrap ml-0.5'>
                    on the billing start day
                  </span>
                </div>
              </li>
              <li className='text-sm'>
                <div className='flex items-baseline'>
                  <span className='whitespace-nowrap '>Customer has</span>
                  <div className='inline z-10'>
                    <InlineSelect
                      id='dueDays'
                      name='dueDays'
                      label='Payment due'
                      placeholder='0 days'
                      options={paymentDueOptions}
                      value={contractStore?.tempValue?.billingDetails?.dueDays}
                      onChange={(selectedOption) =>
                        contractStore?.updateTemp((contract) => ({
                          ...contract,
                          billingDetails: {
                            ...contract.billingDetails,
                            dueDays: selectedOption.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <span className='whitespace-nowrap ml-0.5'>to pay</span>
                </div>
              </li>
              <li className='text-sm'>
                <div className='flex items-baseline'>
                  <span className='whitespace-nowrap '>Billing is </span>
                  <div>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='font-normal text-sm p-0 ml-1 relative text-gray-500 hover:bg-transparent focus:bg-transparent underline'
                      onClick={() =>
                        contractStore?.updateTemp((contract) => ({
                          ...contract,
                          billingEnabled:
                            !contractStore?.tempValue.billingEnabled,
                        }))
                      }
                    >
                      {contractStore?.tempValue.billingEnabled
                        ? 'enabled'
                        : 'disabled'}
                    </Button>
                  </div>
                  <span className='whitespace-nowrap ml-0.5'>
                    in CustomerOS
                  </span>
                </div>
              </li>
              <li className='text-sm'>
                <div className='flex items-baseline'>
                  <span className='whitespace-nowrap '>
                    Invoices are billed to{' '}
                  </span>
                  <div>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={openAddressModal}
                      dataTest='contract-billing-details-address'
                      className='font-normal text-sm p-0 ml-1 relative text-gray-500 hover:bg-transparent focus:bg-transparent underline'
                    >
                      {contractStore?.tempValue.billingDetails
                        ?.organizationLegalName || 'this address'}
                    </Button>
                  </div>
                </div>
              </li>
            </ul>
            <div className='flex relative items-center h-8 '>
              <p className='text-sm text-gray-500 after:border-t-2 w-fit whitespace-nowrap mr-2'>
                Payment options
              </p>
              <Divider />
            </div>

            <div className='flex flex-col gap-2 mb-2'>
              <div className='flex flex-col w-full justify-between items-start'>
                <div className='flex  items-center justify-between w-full'>
                  <PaymentDetailsPopover
                    withNavigation
                    agentId={cashflowAgent?.id}
                    content={isStripeEnabled ? '' : ' Enable Stripe in the'}
                  >
                    <div className='text-sm font-normal whitespace-nowrap'>
                      Checkout with Stripe (Card & ACH)
                    </div>
                  </PaymentDetailsPopover>

                  <Switch
                    size='sm'
                    name='payAutomatically'
                    isInvalid={!isStripeEnabled}
                    isChecked={
                      !!contractStore?.tempValue?.billingDetails?.payOnline
                    }
                    onChange={(value) => {
                      contractStore?.updateTemp((contract) => ({
                        ...contract,
                        billingDetails: {
                          ...contract.billingDetails,
                          payOnline: value,
                          payAutomatically: value,
                        },
                      }));
                    }}
                  />
                </div>
              </div>

              {contractStore?.tempValue.billingDetails?.payOnline && (
                <RadioGroup
                  name='created-date'
                  value={`${!!contractStore.tempValue.billingDetails
                    ?.payAutomatically}`}
                  onValueChange={(newValue) => {
                    contractStore?.updateTemp((contract) => ({
                      ...contract,
                      billingDetails: {
                        ...contract.billingDetails,
                        payAutomatically: newValue === 'true',
                      },
                    }));
                  }}
                >
                  <div className='text-sm flex flex-col gap-2 items-start'>
                    <Radio value={'true'}>
                      <span>Auto-charge invoices</span>
                    </Radio>
                    <Radio value={'false'}>
                      <span>One-off payment link</span>
                    </Radio>
                  </div>
                </RadioGroup>
              )}

              <div className='flex w-full justify-between items-center'>
                <PaymentDetailsPopover
                  withNavigation
                  agentId={cashflowAgent?.id}
                  content={
                    isBankPaymentEnabled ? '' : 'Enable bank transfer in the'
                  }
                >
                  <div className='font-normal text-sm whitespace-nowrap'>
                    Bank transfer
                  </div>
                </PaymentDetailsPopover>
                <Switch
                  size='sm'
                  name='canPayWithBankTransfer'
                  isInvalid={!isBankPaymentEnabled}
                  isChecked={
                    !!contractStore?.tempValue?.billingDetails
                      ?.canPayWithBankTransfer
                  }
                  onChange={(value) =>
                    contractStore?.updateTemp((contract) => ({
                      ...contract,
                      billingDetails: {
                        ...contract.billingDetails,
                        canPayWithBankTransfer: value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </>
        )}

        <ContractUploader contractId={contractId} />
      </ModalBody>
    );
  },
);
