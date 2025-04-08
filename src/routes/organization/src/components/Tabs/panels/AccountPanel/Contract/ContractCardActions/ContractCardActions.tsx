import { useMemo } from 'react';

import { Icon } from '@ui/media/Icon';
import { ContractStatus } from '@graphql/types';
import { ContractEndModal } from '@organization/components/Tabs/panels/AccountPanel/Contract/ChangeContractStatusModals';
import { ContractMenu } from '@organization/components/Tabs/panels/AccountPanel/Contract/ContractCardActions/ContractMenu';
import { ContractStatusTag } from '@organization/components/Tabs/panels/AccountPanel/Contract/ContractCardActions/ContractStatusTag';
import { ContractStatusModal } from '@organization/components/Tabs/panels/AccountPanel/Contract/ChangeContractStatusModals/ContractStatusModal';
import {
  ContractStatusModalMode,
  useContractModalStatusContext,
} from '@organization/components/Tabs/panels/AccountPanel/context/ContractStatusModalsContext';

interface ContractStatusSelectProps {
  contractId: string;
  status: ContractStatus;
  serviceStarted?: string;
  organizationName: string;
  onOpenEditModal: () => void;
}

export const ContractCardActions = ({
  status,
  contractId,
  organizationName,
  serviceStarted,
  onOpenEditModal,
}: ContractStatusSelectProps) => {
  const { onStatusModalOpen } = useContractModalStatusContext();
  const getStatusDisplay = useMemo(() => {
    let icon, text;

    switch (status) {
      case ContractStatus.Live:
        icon = (
          <Icon
            name='x-square'
            className='text-grayModern-500 group-hover:text-grayModern-700'
          />
        );
        text = 'End contract...';
        break;
      case ContractStatus.Draft:
        icon = <Icon name='play' />;
        text = 'Make live';
        break;
      case ContractStatus.OutOfContract:
        icon = (
          <Icon
            name='refresh-ccw-02'
            className='text-grayModern-500 group-hover:text-grayModern-700'
          />
        );
        text = 'Renew contract';
        break;
      case ContractStatus.Scheduled:
        icon = null;
        text = null;
        break;
      default:
        icon = null;
        text = null;
    }

    return (
      <>
        {icon}
        {text}
      </>
    );
  }, [status]);

  const handleChangeStatus = () => {
    switch (status) {
      case ContractStatus.Live:
        onStatusModalOpen(ContractStatusModalMode.End);
        break;
      case ContractStatus.Draft:
        onStatusModalOpen(ContractStatusModalMode.Start);
        break;

      case ContractStatus.OutOfContract:
        onStatusModalOpen(ContractStatusModalMode.Renew);

        break;
      case ContractStatus.Scheduled:
        break;
      default:
    }
  };

  return (
    <div className='flex items-center gap-2 ml-2'>
      <ContractStatusTag
        status={status}
        contractStarted={serviceStarted}
        statusContent={getStatusDisplay}
        onHandleStatusChange={handleChangeStatus}
      />
      <ContractMenu
        status={status}
        statusContent={getStatusDisplay}
        onOpenEditModal={onOpenEditModal}
        onHandleStatusChange={handleChangeStatus}
      />
      <ContractEndModal
        contractId={contractId}
        serviceStarted={serviceStarted}
        organizationName={organizationName}
      />
      <ContractStatusModal
        contractId={contractId}
        serviceStarted={serviceStarted}
        organizationName={organizationName}
      />
    </div>
  );
};
