import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useDeepCompareEffect } from 'rooks';

import { Play } from '@ui/media/icons/Play';
import { Plus } from '@ui/media/icons/Plus';
import { Edit03 } from '@ui/media/icons/Edit03';
import { Button } from '@ui/form/Button/Button';
import { RefreshCw05 } from '@ui/media/icons/RefreshCw05';
import { ArrowNarrowRight } from '@ui/media/icons/ArrowNarrowRight';
import { Agent, Invoice, Contract, ContractStatus } from '@graphql/types';
import { UpcomingInvoice } from '@organization/components/Tabs/panels/AccountPanel/Contract/UpcomingInvoices/UpcomingInvoice.tsx';
import {
  ContractStatusModalMode,
  useContractModalStatusContext,
} from '@organization/components/Tabs/panels/AccountPanel/context/ContractStatusModalsContext';

interface ContractCardProps {
  data: Contract;
  cashflowGuardianAgent: Agent | null;
  onOpenBillingDetailsModal: () => void;
  onOpenServiceLineItemsModal: () => void;
}

export const UpcomingInvoices = observer(
  ({
    data,
    cashflowGuardianAgent,
    onOpenBillingDetailsModal,
    onOpenServiceLineItemsModal,
  }: ContractCardProps) => {
    const [isPaused, setIsPaused] = useState(false);
    const navigate = useNavigate();

    const { onStatusModalOpen } = useContractModalStatusContext();

    const getIsPaused = (): boolean => {
      if (
        [
          ContractStatus.OutOfContract,
          ContractStatus.Draft,
          ContractStatus.Ended,
        ].includes(data.contractStatus)
      ) {
        return true;
      }

      if (!data.billingEnabled) {
        return true;
      }

      const hasAllRequiredFields = [
        data?.billingDetails?.billingEmail,
        data?.billingDetails?.organizationLegalName,
      ].every((field) => !!field);

      if (!hasAllRequiredFields) {
        return true;
      }

      if (!cashflowGuardianAgent?.isActive) return true;

      return !data?.contractLineItems?.length;
    };

    useDeepCompareEffect(() => {
      const paused = getIsPaused();

      setIsPaused(paused);
    }, [data]);

    const getActionButton = () => {
      if (
        !data?.billingDetails?.billingEmail &&
        !data?.billingDetails?.organizationLegalName
      ) {
        return (
          <Button
            size='xxs'
            colorScheme='grayModern'
            onClick={onOpenBillingDetailsModal}
            className='ml-2 font-normal rounded'
            leftIcon={<Edit03 className='size-3' />}
          >
            Complete details
          </Button>
        );
      }

      if (!data?.billingDetails?.billingEmail) {
        return (
          <Button
            size='xxs'
            colorScheme='grayModern'
            onClick={onOpenBillingDetailsModal}
            className='ml-2 font-normal rounded'
            leftIcon={<Edit03 className='size-3' />}
          >
            Add email
          </Button>
        );
      }

      if (!data?.billingEnabled) {
        return (
          <Button
            size='xxs'
            colorScheme='grayModern'
            className='ml-2 font-normal rounded'
            onClick={onOpenServiceLineItemsModal}
          >
            Enable invoicing
          </Button>
        );
      }

      if (!data?.contractLineItems?.length) {
        return (
          <Button
            size='xxs'
            colorScheme='grayModern'
            className='ml-2 font-normal rounded'
            onClick={onOpenServiceLineItemsModal}
            leftIcon={<Plus className='size-3' />}
          >
            Add a service
          </Button>
        );
      }

      if (data.contractStatus === ContractStatus.OutOfContract) {
        return (
          <Button
            size='xxs'
            colorScheme='grayModern'
            leftIcon={<RefreshCw05 />}
            className='ml-2 font-normal rounded'
            onClick={() => onStatusModalOpen(ContractStatusModalMode.Renew)}
          >
            Renew contract
          </Button>
        );
      }

      if (data.contractStatus === ContractStatus.Draft) {
        return (
          <Button
            size='xxs'
            leftIcon={<Play />}
            colorScheme='primary'
            className='ml-2 font-normal rounded'
            onClick={() => onStatusModalOpen(ContractStatusModalMode.Start)}
          >
            Make contract live
          </Button>
        );
      }

      if (!cashflowGuardianAgent?.isActive) {
        return (
          <Button
            size='xxs'
            colorScheme='grayModern'
            className='ml-2 font-normal rounded'
            onClick={() => navigate(`/agents/${cashflowGuardianAgent?.id}`)}
          >
            Enable Cashflow Guardian
          </Button>
        );
      }
    };

    return (
      <article className='w-full'>
        <div className='text-sm font-medium mb-1 flex'>
          <span className='whitespace-nowrap'>Next invoice</span>
          {isPaused && (
            <div className='flex w-full justify-between'>
              <div>
                <ArrowNarrowRight className='mx-1' />
                <span className='font-normal'>Paused</span>
              </div>
              {getActionButton()}
            </div>
          )}
        </div>
        <div>
          {data?.upcomingInvoices.map((invoice: Invoice) => (
            <UpcomingInvoice
              id={invoice?.invoiceNumber}
              key={invoice?.invoiceNumber}
              contractId={data?.metadata?.id}
            />
          ))}
        </div>
      </article>
    );
  },
);
