import React, { useState } from 'react';

import { ContractStore } from '@store/Contracts/Contract.store.ts';

import { cn } from '@ui/utils/cn';
import { DateTimeUtils } from '@utils/date';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { Invoice, ContractStatus } from '@graphql/types';
import { formatCurrency } from '@utils/getFormattedCurrencyNumber';
import { DatePickerUnderline } from '@ui/form/DatePicker/DatePickerUnderline';

interface ContractStartModalProps {
  contractId: string;
  onClose: () => void;
  serviceStarted?: string;
  organizationName: string;
  status?: ContractStatus | null;
}

export const ContractStartModal = ({
  onClose,
  contractId,
  organizationName,
  serviceStarted,
  status,
}: ContractStartModalProps) => {
  const store = useStore();
  const contractStore = store.contracts.value.get(contractId) as ContractStore;
  const nextInvoice = contractStore?.value?.upcomingInvoices?.find(
    (invoice: Invoice) => invoice.issued === true,
  );

  const [serviceStartedData, setServiceStarted] = useState<
    string | Date | null | undefined
  >(serviceStarted ? new Date(serviceStarted) : new Date());

  const handleApplyChanges = () => {
    contractStore?.update((prev) => ({
      ...prev,
      serviceStarted: serviceStartedData,
      approved: true,
    }));

    if (
      DateTimeUtils.isPast(serviceStartedData as string) ||
      DateTimeUtils.isToday(serviceStartedData as string)
    ) {
      contractStore?.update(
        (prev) => ({
          ...prev,
          status: ContractStatus.Live,
        }),
        { mutate: false },
      );
    } else {
      contractStore?.update(
        (prev) => ({
          ...prev,
          status: ContractStatus.Scheduled,
        }),
        { mutate: false },
      );
    }
    onClose();
  };

  return (
    <>
      <div
        className={
          'rounded-2xl max-w-[600px] h-full flex flex-col justify-between'
        }
      >
        <div>
          <div>
            <h1 className={cn('text-base font-semibold  mb-2')}>
              {status === ContractStatus.OutOfContract
                ? 'Renew contract'
                : 'Make this contract live?'}
            </h1>
          </div>
          <div className='flex flex-col'>
            <div className='text-sm'>
              Congrats! Let’s make{' '}
              <span className='font-medium '>{organizationName}’s </span>
              contract live starting on
              <div className='ml-1 inline-flex text-sm'>
                <DatePickerUnderline
                  value={serviceStartedData as string}
                  onChange={(e) => setServiceStarted(e)}
                />
              </div>
            </div>
            <p className='text-sm mt-3'>
              Once the contract goes live, we’ll start sending invoices.
            </p>
            {nextInvoice && (
              <p className='text-sm'>
                The first one will be for
                <span className='text-sm ml-1 font-medium'>
                  {formatCurrency(
                    nextInvoice.amountDue,
                    2,
                    nextInvoice.currency,
                  )}{' '}
                  on{' '}
                  {DateTimeUtils.format(
                    nextInvoice.issued,
                    DateTimeUtils.defaultFormatShortString,
                  )}{' '}
                  (
                  {DateTimeUtils.format(
                    nextInvoice.invoicePeriodStart,
                    DateTimeUtils.dateDayAndMonth,
                  )}{' '}
                  -{' '}
                  {DateTimeUtils.format(
                    nextInvoice.invoicePeriodEnd,
                    DateTimeUtils.dateDayAndMonth,
                  )}
                  )
                </span>
              </p>
            )}
          </div>
        </div>

        <div className='mt-4 flex'>
          <Button
            size='sm'
            variant='outline'
            onClick={onClose}
            className='w-full'
          >
            Not now
          </Button>
          <Button
            size='sm'
            variant='outline'
            colorScheme='primary'
            className='ml-3 w-full'
            loadingText='Saving...'
            onClick={handleApplyChanges}
          >
            Go live{' '}
            {DateTimeUtils.format(
              serviceStartedData as string,
              DateTimeUtils.defaultFormatShortString,
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
