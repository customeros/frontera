import { useMemo, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { ContractStore } from '@store/Contracts/Contract.store.ts';

import { Input } from '@ui/form/Input';
import { DateTimeUtils } from '@utils/date';
import { useStore } from '@shared/hooks/useStore';
import { Divider } from '@ui/presentation/Divider/Divider';
import { Contract, AgentType, ContractStatus } from '@graphql/types';
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
  values: Contract;
  organizationName: string;
}

export const ContractCard = observer(
  ({ organizationName, values }: ContractCardProps) => {
    const store = useStore();
    const contractStore = store.contracts.value.get(
      values.metadata.id,
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
      DateTimeUtils.differenceInMins(
        contract?.metadata.lastUpdated,
        contract?.metadata.created,
      ) === 0;
    const noInvoicesYet =
      contract.upcomingInvoices.length === 0 || contract.invoices.length === 0;

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
          <article
            data-test='contract-card-header'
            className='flex justify-between flex-1 w-full'
          >
            <Input
              name='contractName'
              value={contract?.contractName}
              placeholder='Add contract name'
              onFocus={(e) => e.target.select()}
              onBlur={(e) => {
                contractStore?.updateContractName(e.target.value);
              }}
              className='font-medium hover:border-none focus:border-none max-h-6 min-h-0 w-full overflow-hidden overflow-ellipsis border-0'
              onChange={(e) => {
                contractStore?.update(
                  (prev) => ({
                    ...prev,
                    contractName: e.target.value,
                  }),
                  {
                    mutate: false,
                  },
                );
              }}
            />

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
          </article>

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
            noInvoicesYet &&
            !contractEnded &&
            (cashflowAgentStatus || invoicingStatus) && (
              <>
                <Divider className='my-3' />
                <UpcomingInvoices
                  data={contract}
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
