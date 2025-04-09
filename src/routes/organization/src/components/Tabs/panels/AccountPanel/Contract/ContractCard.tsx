import { useMemo, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { differenceInMilliseconds } from 'date-fns';
import { ContractStore } from '@store/Contracts/Contract.store.ts';

import { useStore } from '@shared/hooks/useStore';
import { Divider } from '@ui/presentation/Divider/Divider';
import { AgentType, ContractStatus } from '@graphql/types';
import { Card, CardFooter, CardHeader } from '@ui/presentation/Card/Card';
import { UpcomingInvoices } from '@organization/components/Tabs/panels/AccountPanel/Contract/UpcomingInvoices/UpcomingInvoices';
import { useUpdatePanelModalStateContext } from '@organization/components/Tabs/panels/AccountPanel/context/AccountModalsContext';
import {
  EditModalMode,
  useContractModalStateContext,
} from '@organization/components/Tabs/panels/AccountPanel/context/ContractModalsContext';

import { Services } from './Services/Services';
import { ContractSubtitle } from './ContractSubtitle';
import { ContractCardActions } from './ContractCardActions';
import { RenewalARRCard } from './RenewalARR/RenewalARRCard';
import { EditContractModal } from './ContractBillingDetailsModal/EditContractModal';

interface ContractCardProps {
  contractId: string;
  organizationName: string;
}

export const ContractCard = observer(
  ({ organizationName, contractId }: ContractCardProps) => {
    const store = useStore();
    const contractStore = store.contracts.value.get(
      contractId,
    ) as ContractStore;

    const [isExpanded, setIsExpanded] = useState(
      !contractStore?.value?.contractSigned,
    );
    const { setIsPanelModalOpen } = useUpdatePanelModalStateContext();
    const {
      isEditModalOpen,
      onEditModalOpen,
      onChangeModalMode,
      onEditModalClose,
    } = useContractModalStateContext();

    // this is needed to block scroll on safari when modal is open, scrollbar overflow issue
    useEffect(() => {
      if (isEditModalOpen) {
        setIsPanelModalOpen(true);
      }

      if (!isEditModalOpen) {
        setIsPanelModalOpen(false);
      }
    }, [isEditModalOpen]);

    if (!contractStore) return null;

    const contract = contractStore.value;

    const handleOpenBillingDetails = () => {
      onChangeModalMode(EditModalMode.BillingDetails);
      onEditModalOpen();
    };

    const handleOpenContractDetails = () => {
      onChangeModalMode(EditModalMode.ContractDetails);
      onEditModalOpen();
    };
    const opportunityId = useMemo(() => {
      return (
        contract?.opportunities?.find((e) => e.internalStage === 'OPEN')?.id ||
        contract?.opportunities?.[0]?.id
      );
    }, []);

    const isJustCreated =
      differenceInMilliseconds(
        contract?.metadata.lastUpdated,
        contract?.metadata.created,
      ) === 0;

    const cashFlowAgent = store.agents.getFirstAgentByType(
      AgentType.CashflowGuardian,
    );
    const cashflowAgentStatus = cashFlowAgent?.value.isActive;
    const invoicingStatus = contract.billingEnabled;
    const contractEnded = contract.contractStatus === ContractStatus.Ended;

    return (
      <Card className='px-4 py-3 w-full text-lg bg-grayModern-25 transition-all-0.2s-ease-out border border-grayModern-200 text-grayModern-700 '>
        <CardHeader
          role='button'
          className='p-0 w-full flex flex-col'
          onClick={() => (!isExpanded ? setIsExpanded(true) : null)}
        >
          <div
            data-test='contract-card-header'
            className='flex justify-between flex-1 w-full'
          >
            <p
              className='font-medium text-[16px]'
              onClick={handleOpenContractDetails}
            >
              {contract?.contractName}
            </p>

            <ContractCardActions
              status={contract?.contractStatus}
              contractId={contract?.metadata?.id}
              serviceStarted={contract?.serviceStarted}
              onOpenEditModal={handleOpenContractDetails}
              organizationName={
                contract?.billingDetails?.organizationLegalName ||
                organizationName ||
                'Unnamed'
              }
            />
          </div>

          <div
            tabIndex={1}
            role='button'
            className='w-full'
            onClick={handleOpenContractDetails}
          >
            <ContractSubtitle id={contract.metadata.id} />
          </div>
        </CardHeader>

        <CardFooter className='p-0 mt-0 w-full flex flex-col'>
          {opportunityId &&
            !!contract?.contractLineItems?.filter(
              (e) => !e.metadata.id.includes('new'),
            )?.length && (
              <RenewalARRCard
                currency={contract?.currency}
                opportunityId={opportunityId}
                contractId={contract?.metadata?.id}
                startedAt={contract?.serviceStarted}
                hasEnded={contract?.contractStatus === ContractStatus.Ended}
              />
            )}
          <Services
            id={contract?.metadata?.id}
            currency={contract?.currency}
            onModalOpen={onEditModalOpen}
            data={contract?.contractLineItems}
          />
          {!isJustCreated &&
            !contractEnded &&
            (cashflowAgentStatus || invoicingStatus) && (
              <>
                <Divider className='my-3' />
                <UpcomingInvoices
                  contractId={contractId}
                  cashflowGuardianAgent={cashFlowAgent?.value ?? null}
                  onOpenBillingDetailsModal={handleOpenBillingDetails}
                  onOpenServiceLineItemsModal={handleOpenContractDetails}
                />
              </>
            )}

          <EditContractModal
            isOpen={isEditModalOpen}
            onClose={onEditModalClose}
            opportunityId={opportunityId}
            status={contract?.contractStatus}
            contractId={contract?.metadata?.id}
            organizationName={organizationName}
            serviceStarted={contract?.serviceStarted}
            notes={contract?.billingDetails?.invoiceNote}
          />
        </CardFooter>
      </Card>
    );
  },
);
