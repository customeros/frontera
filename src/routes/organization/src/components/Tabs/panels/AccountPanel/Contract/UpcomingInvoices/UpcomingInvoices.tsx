import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';

import { Play } from '@ui/media/icons/Play';
import { Plus } from '@ui/media/icons/Plus';
import { Edit03 } from '@ui/media/icons/Edit03';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { RefreshCw05 } from '@ui/media/icons/RefreshCw05';
import { Agent, Invoice, ContractStatus } from '@graphql/types';
import { ArrowNarrowRight } from '@ui/media/icons/ArrowNarrowRight';
import { UpcomingInvoice } from '@organization/components/Tabs/panels/AccountPanel/Contract/UpcomingInvoices/UpcomingInvoice.tsx';
import {
  ContractStatusModalMode,
  useContractModalStatusContext,
} from '@organization/components/Tabs/panels/AccountPanel/context/ContractStatusModalsContext';

interface UpcomingInvoicesProps {
  contractId: string;
  cashflowGuardianAgent: Agent | null;
  onOpenBillingDetailsModal: () => void;
  onOpenServiceLineItemsModal: () => void;
}

export const UpcomingInvoices = observer(
  ({
    cashflowGuardianAgent,
    onOpenBillingDetailsModal,
    onOpenServiceLineItemsModal,
    contractId,
  }: UpcomingInvoicesProps) => {
    const store = useStore();
    const navigate = useNavigate();
    const [isPaused, setIsPaused] = useState(false);
    const contract = store.contracts.value.get(contractId);
    const { onStatusModalOpen } = useContractModalStatusContext();

    if (!contract) return null;

    const getIsPaused = useMemo((): boolean => {
      if (
        [
          ContractStatus.OutOfContract,
          ContractStatus.Draft,
          ContractStatus.Ended,
        ].includes(contract.value?.contractStatus)
      ) {
        return true;
      }

      if (!contract.value?.billingEnabled) {
        return true;
      }

      const hasAllRequiredFields = [
        contract.value?.billingDetails?.billingEmail,
        contract.value?.billingDetails?.organizationLegalName,
      ].every((field) => !!field);

      if (!hasAllRequiredFields) {
        return true;
      }

      if (!cashflowGuardianAgent?.isActive) return true;

      return !contract.value?.contractLineItems?.length;
    }, [
      contract.value.billingEnabled,
      cashflowGuardianAgent,
      contract.value?.contractLineItems,
    ]);

    useEffect(() => {
      setIsPaused(getIsPaused);
    }, [getIsPaused]);

    const getActionButton = () => {
      if (
        !contract.value?.billingDetails?.billingEmail &&
        !contract.value?.billingDetails?.organizationLegalName
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

      if (!contract.value?.billingDetails?.billingEmail) {
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

      if (!contract.value?.billingEnabled) {
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

      if (!contract.value?.contractLineItems?.length) {
        return (
          <Button
            size='xxs'
            colorScheme='grayModern'
            className='ml-2 font-normal rounded'
            onClick={onOpenServiceLineItemsModal}
            leftIcon={<Plus className='size-3' />}
          >
            Add a product
          </Button>
        );
      }

      if (contract.value?.contractStatus === ContractStatus.OutOfContract) {
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

      if (contract.value?.contractStatus === ContractStatus.Draft) {
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
          {contract.value?.upcomingInvoices.length > 0 ? (
            contract.value?.upcomingInvoices.map((invoice: Invoice) => (
              <UpcomingInvoice
                contractId={contractId}
                id={invoice?.invoiceNumber}
                key={invoice?.invoiceNumber}
              />
            ))
          ) : (
            <p className='text-sm text-grayModern-500'>No invoices yet</p>
          )}
        </div>
      </article>
    );
  },
);
