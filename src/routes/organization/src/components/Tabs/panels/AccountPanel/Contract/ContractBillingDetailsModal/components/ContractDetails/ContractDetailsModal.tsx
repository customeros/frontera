import { useParams } from 'react-router-dom';
import { useRef, useMemo, useState, useEffect } from 'react';

import set from 'lodash/set';
import { observer } from 'mobx-react-lite';
import { motion, Variants } from 'framer-motion';
import { ContractStore } from '@store/Contracts/Contract.store';
import { ContractLineItemStore } from '@store/ContractLineItems/ContractLineItem.store';

import { cn } from '@ui/utils/cn';
import { Input } from '@ui/form/Input';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { ModalFooter, ModalHeader } from '@ui/overlay/Modal/Modal';
import { calculateMaxArr } from '@organization/components/Tabs/panels/AccountPanel/utils';
import {
  Contract,
  ContractStatus,
  ServiceLineItem,
  TenantBillingProfile,
} from '@graphql/types';
import {
  EditModalMode,
  useContractModalStateContext,
} from '@organization/components/Tabs/panels/AccountPanel/context/ContractModalsContext';

import { ContractStatusTag } from './ContractStatusTag';
import { ContractBillingDetailsForm } from './ContractBillingDetailsForm';

interface ContractDetailsModalProps {
  contractId: string;
  status: ContractStatus;
  opportunityId?: string;
  serviceStarted?: string;
}

const mainVariants = {
  open: {
    w: '424px',
    minW: '424px',
    x: 0,
    position: 'relative',
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  closed: {
    w: '100px',
    minW: '100px',
    position: 'absolute',
    x: '-32px',
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

export const ContractDetailsModal = observer(
  ({
    contractId,
    status,
    serviceStarted,
    opportunityId,
  }: ContractDetailsModalProps) => {
    const store = useStore();
    const organizationId = useParams().id as string;
    const contractStore = store.contracts.value.get(
      contractId,
    ) as ContractStore;
    const contractNameInputRef = useRef<HTMLInputElement | null>(null);
    const organizationStore = store.organizations.value.get(organizationId);
    const opportunityStore = opportunityId
      ? store.opportunities.value.get(opportunityId)
      : undefined;

    const {
      isEditModalOpen,
      onChangeModalMode,
      onEditModalClose,
      editModalMode,
    } = useContractModalStateContext();

    const [isSaving, setIsSaving] = useState(false);

    const bankAccounts = store.settings.bankAccounts.toArray();

    const tenantBillingProfiles =
      store.settings.tenantBillingProfiles.toArray();
    const contractLineItemsStore = store.contractLineItems;

    useEffect(() => {
      if (isEditModalOpen) {
        setTimeout(() => {
          contractNameInputRef.current?.focus();
          contractNameInputRef.current?.select();
        });
      }
    }, [isEditModalOpen]);

    useEffect(() => {
      if (isEditModalOpen) {
        contractStore?.setTempValue();
      }
    }, [isEditModalOpen]);

    const getOpportunitiesStores = (contract: Contract) => {
      const c = store.contracts.value.get(contract.metadata.id)?.value;

      return (
        c?.opportunities?.map((e) => {
          return store.opportunities.value.get(e?.metadata?.id)?.value;
        }) || []
      );
    };

    const handleUpdateArrForecast = () => {
      // update opportunity
      const contractLineItemsStores =
        contractStore?.value?.contractLineItems?.map((e) => {
          return contractLineItemsStore.value.get(e.metadata.id)?.value;
        });

      const arrOpportunity = calculateMaxArr(
        contractLineItemsStores as ServiceLineItem[],
        contractStore?.tempValue as Contract,
      );

      opportunityStore?.update(
        (prev) => ({
          ...prev,
          maxAmount: arrOpportunity,
          amount: (arrOpportunity * prev.renewalAdjustedRate) / 100,
        }),
        { mutate: false },
      );

      const contracts = organizationStore?.contracts || [];

      const totalArr = contracts.reduce(
        (acc, contract) => {
          const opportunities = getOpportunitiesStores(contract).filter(
            (e) => e?.internalStage === 'OPEN' && e?.internalType === 'RENEWAL',
          );

          const amount = opportunities.reduce(
            (acc, opportunity) => acc + (opportunity?.amount ?? 0) || 0,
            0,
          );
          const maxAmount = opportunities.reduce(
            (acc, opportunity) => acc + (opportunity?.maxAmount ?? 0) || 0,
            0,
          );

          return {
            maxArrForecast: acc.maxArrForecast + maxAmount,
            arrForecast: acc.arrForecast + amount,
          };
        },
        { maxArrForecast: 0, arrForecast: 0 },
      );

      organizationStore?.draft();

      set(
        organizationStore!.value,
        'accountDetails.renewalSummary.arrForecast',
        totalArr?.arrForecast,
      );
      set(
        organizationStore!.value,
        'accountDetails.renewalSummary.maxArrForecast',
        totalArr.maxArrForecast,
      );

      organizationStore?.commit();
    };

    const handleCloseModal = () => {
      setIsSaving(false);
      onEditModalClose();
      onChangeModalMode(EditModalMode.ContractDetails);
    };

    // TODO: Refactor to use a single API request for contract changes
    // https://linear.app/customer-os/issue/COS-5225/api-mutation-changes-for-contract-details
    // Current implementation:
    // - Multiple API calls for a single UI action
    // - Complex and potentially unstable front-end logic
    // - Risk of partial updates and inconsistent contract state
    //
    // Proposed solution:
    // - Work with backend team to create a bulk update API endpoint
    // - Refactor this component to use the new endpoint
    // - Simplify error handling and user feedback
    //
    // Benefits:
    // - Simplified front-end logic
    // - Improved reliability and data consistency
    // - Improved stability and maintainability
    //
    // NOTE: This refactor is blocked by backend API limitations
    const handleApplyChanges = async () => {
      try {
        setIsSaving(true);
        contractStore.value = contractStore.tempValue;

        const promises = [];

        promises.push(contractStore.updateContractValues());

        contractStore?.value?.contractLineItems?.forEach((e) => {
          const itemStore = contractLineItemsStore.value.get(
            e.metadata.id,
          ) as ContractLineItemStore;

          if (!itemStore?.tempValue) return;

          if (!itemStore.value.closed && itemStore.tempValue.closed) {
            if (!e.metadata.id.includes('new')) {
              promises.push(
                contractLineItemsStore.closeServiceLineItem({
                  id: e.metadata.id,
                }),
              );
            } else {
              store.contractLineItems.value.get(e.metadata.id)?.update(
                (prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    id: e.metadata.id.replace('new', 'closed'),
                  },
                  serviceEnded: new Date(-1).toISOString(),
                  closed: true,
                }),
                { mutate: false },
              );
            }
          } else if (
            e.metadata.id.includes('new') &&
            !itemStore.tempValue?.parentId?.length
          ) {
            promises.push(
              contractLineItemsStore.createNewServiceLineItem(
                itemStore.tempValue,
                contractId,
              ),
            );
          } else if (
            e.metadata.id.includes('new') &&
            itemStore.tempValue?.parentId?.length > 0
          ) {
            promises.push(
              contractLineItemsStore.createNewVersion(
                itemStore.tempValue,
                contractId,
              ),
            );
          } else {
            promises.push(itemStore?.updateServiceLineItem());
          }
        });

        await Promise.all(promises);

        setTimeout(() => {
          contractStore.invalidate();
        }, 6000); // wait for the contract to be updated, sli are processed slowly at times hence the delay

        handleCloseModal();
        handleUpdateArrForecast();
      } catch (error) {
        console.error('Error applying changes:', error);
      }
    };

    const availableCurrencies = useMemo(
      () => bankAccounts?.map((e) => e.value.currency),
      [],
    );

    const canAllowPayWithBankTransfer = useMemo(() => {
      return availableCurrencies.includes(contractStore?.tempValue?.currency);
    }, [availableCurrencies, contractStore?.tempValue?.currency]);

    useEffect(() => {
      if (!canAllowPayWithBankTransfer) {
        contractStore?.updateTemp((prev) => ({
          ...prev,
          billingDetails: {
            ...prev.billingDetails,
            canPayWithBankTransfer: false,
          },
        }));
      }
    }, [canAllowPayWithBankTransfer]);

    return (
      <>
        <motion.div
          layout
          variants={mainVariants as Variants}
          animate={
            editModalMode === EditModalMode.ContractDetails ? 'open' : 'closed'
          }
          onClick={() =>
            editModalMode === EditModalMode.BillingDetails
              ? onChangeModalMode(EditModalMode.ContractDetails)
              : null
          }
          className={cn(
            'flex flex-col gap-4 px-6 pb-6 pt-4 bg-grayModern-25  rounded-lg justify-between relative h-[80vh] w-[460px] overflow-y-auto overflow-x-hidden',
            {
              'cursor-pointer': editModalMode === EditModalMode.BillingDetails,
            },
          )}
        >
          <ModalHeader className='p-0 font-semibold flex'>
            <Input
              name='contractName'
              ref={contractNameInputRef}
              placeholder='Add contract name'
              onFocus={(e) => e.target.select()}
              value={contractStore?.tempValue?.contractName}
              className='font-semibold text-base no-border-bottom hover:border-none focus:border-none max-h-6 min-h-0 w-full overflow-hidden overflow-ellipsis truncate'
              onChange={(e) =>
                contractStore?.updateTemp((prev) => ({
                  ...prev,
                  contractName: e.target.value,
                }))
              }
            />

            <ContractStatusTag
              status={status}
              contractStarted={serviceStarted}
            />
          </ModalHeader>

          <ContractBillingDetailsForm
            contractId={contractId}
            contractStatus={contractStore?.tempValue?.contractStatus}
            openAddressModal={() =>
              onChangeModalMode(EditModalMode.BillingDetails)
            }
            tenantBillingProfile={
              tenantBillingProfiles?.[0]?.value as TenantBillingProfile
            }
          />
          <ModalFooter className='p-0 flex sticky z-[999] -bottom-6 -mb-6 pb-5 pt-3 bg-grayModern-25'>
            <Button
              size='md'
              variant='outline'
              className='w-full'
              colorScheme='grayModern'
              onClick={() => {
                handleCloseModal();
                contractStore?.resetTempValue();
              }}
            >
              Cancel changes
            </Button>
            <Button
              size='md'
              variant='outline'
              isLoading={isSaving}
              colorScheme='primary'
              className='ml-3 w-full'
              loadingText='Saving...'
              onClick={handleApplyChanges}
              dataTest='contract-details-save-draft'
            >
              {contractStore?.value?.contractStatus === ContractStatus.Draft
                ? 'Save draft'
                : 'Save'}
            </Button>
          </ModalFooter>
        </motion.div>
      </>
    );
  },
);
