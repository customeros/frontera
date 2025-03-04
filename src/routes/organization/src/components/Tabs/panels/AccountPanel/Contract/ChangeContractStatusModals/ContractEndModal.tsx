import React, { useState } from 'react';

import { observer } from 'mobx-react-lite';
import { ContractStore } from '@store/Contracts/Contract.store.ts';

import { DateTimeUtils } from '@utils/date';
import { Button } from '@ui/form/Button/Button';
import { ContractStatus } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';
import { Radio, RadioGroup } from '@ui/form/Radio/Radio';
import { DatePickerUnderline } from '@ui/form/DatePicker/DatePickerUnderline';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
  ModalOverlay,
} from '@ui/overlay/Modal/Modal';
import {
  ContractStatusModalMode,
  useContractModalStatusContext,
} from '@organization/components/Tabs/panels/AccountPanel/context/ContractStatusModalsContext';

interface ContractEndModalProps {
  contractId: string;
  contractEnded?: string;
  serviceStarted?: string;
  organizationName: string;
}

const today = new Date().toUTCString();

export enum EndContract {
  Now = 'Now',
  EndOfCurrentBillingPeriod = 'EndOfCurrentBillingPeriod',
  EndOfCurrentRenewalPeriod = 'EndOfCurrentRenewalPeriod',
  CustomDate = 'CustomDate',
}
export const ContractEndModal = observer(
  ({ contractId, organizationName, contractEnded }: ContractEndModalProps) => {
    const store = useStore();
    const contractStore = store.contracts.value.get(
      contractId,
    ) as ContractStore;
    const opportunitiesStore = store.opportunities.toArray();

    const [value, setValue] = useState(EndContract.Now);
    const renewsAt = opportunitiesStore?.find(
      (e) => e.value?.internalStage === 'OPEN',
    )?.value?.renewedAt;
    const timeToRenewal = renewsAt
      ? DateTimeUtils.format(renewsAt, DateTimeUtils.dateWithAbreviatedMonth)
      : null;
    const nextInvoice = contractStore?.tempValue?.upcomingInvoices?.[0];

    const { isModalOpen, onStatusModalClose, mode } =
      useContractModalStatusContext();
    const timeToNextInvoice = nextInvoice?.issued
      ? DateTimeUtils.format(
          nextInvoice.issued,
          DateTimeUtils.dateWithAbreviatedMonth,
        )
      : null;

    const [endedAt, setEndedAt] = useState<string | Date | null | undefined>(
      contractEnded || new Date().toString(),
    );

    const handleApplyChanges = () => {
      contractStore?.update((prev) => ({
        ...prev,
        endedAt: new Date(endedAt as string),
        contractStatus: DateTimeUtils.isFuture(endedAt as string)
          ? prev.contractStatus
          : ContractStatus.Ended,
      }));
      onStatusModalClose();
    };

    const handleChangeEndsOnOption = (nextValue: string | null) => {
      if (nextValue === EndContract.Now) {
        setEndedAt(today);
        setValue(EndContract.Now);

        return;
      }

      if (nextValue === EndContract.EndOfCurrentBillingPeriod) {
        setEndedAt(nextInvoice?.issued);
        setValue(EndContract.EndOfCurrentBillingPeriod);

        return;
      }

      if (nextValue === EndContract.CustomDate) {
        setEndedAt(new Date(today));

        setValue(EndContract.CustomDate);

        return;
      }

      if (nextValue === EndContract.EndOfCurrentRenewalPeriod) {
        setEndedAt(renewsAt);
        setValue(EndContract.EndOfCurrentRenewalPeriod);

        return;
      }
    };

    return (
      <Modal
        onOpenChange={onStatusModalClose}
        open={isModalOpen && mode === ContractStatusModalMode.End}
      >
        <ModalOverlay className='z-50' />
        <ModalContent className='rounded-2xl z-[999]'>
          <ModalHeader className='pb-1'>
            <h2 className='text-base font-semibold'>
              End {organizationName}’s contract?
            </h2>
          </ModalHeader>
          <ModalBody className='flex flex-col gap-1'>
            <p className='text-sm mb-2'>
              Ending this contract{' '}
              <span className='font-medium mr-1'>will close the renewal</span>
              and set the
              <span className='font-medium ml-1'>ARR to zero.</span>
            </p>
            <p className='text-sm'>Let’s end it:</p>

            <RadioGroup
              value={value}
              className='flex flex-col gap-1 text-sm'
              onValueChange={handleChangeEndsOnOption}
            >
              <Radio value={EndContract.Now}>
                <span className='mr-1'>Now</span>
              </Radio>
              {timeToNextInvoice && (
                <Radio value={EndContract.EndOfCurrentBillingPeriod}>
                  <span>
                    End of current billing period, {timeToNextInvoice}
                  </span>
                </Radio>
              )}

              {timeToRenewal && (
                <Radio value={EndContract.EndOfCurrentRenewalPeriod}>
                  <span>End of renewal, {timeToRenewal}</span>
                </Radio>
              )}

              <Radio value={EndContract.CustomDate}>
                <div className='flex items-center max-h-6'>
                  On{' '}
                  {value === EndContract.CustomDate ? (
                    <div className='ml-1'>
                      <DatePickerUnderline
                        onChange={(e) => setEndedAt(e)}
                        value={endedAt || new Date().toString()}
                      />
                    </div>
                  ) : (
                    'custom date'
                  )}
                </div>
              </Radio>
            </RadioGroup>
          </ModalBody>
          <ModalFooter className='p-6 flex'>
            <Button
              size='sm'
              variant='outline'
              className='w-full'
              colorScheme='grayModern'
              onClick={onStatusModalClose}
            >
              Cancel
            </Button>
            <Button
              size='sm'
              variant='outline'
              colorScheme='error'
              className='ml-3 w-full'
              loadingText='Saving...'
              onClick={handleApplyChanges}
            >
              End {value === EndContract.Now && 'now'}
              {value !== EndContract.Now &&
                DateTimeUtils.format(
                  endedAt as string,
                  DateTimeUtils.dateWithAbreviatedMonth,
                )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
);
