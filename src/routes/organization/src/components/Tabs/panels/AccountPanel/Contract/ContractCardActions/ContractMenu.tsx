import { ReactNode } from 'react';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { ContractStatus } from '@graphql/types';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import {
  ContractStatusModalMode,
  useContractModalStatusContext,
} from '@organization/components/Tabs/panels/AccountPanel/context/ContractStatusModalsContext';

interface ContractStatusSelectProps {
  status: ContractStatus;
  statusContent: ReactNode;
  onOpenEditModal: () => void;
  onHandleStatusChange: () => void;
}

export const ContractMenu = ({
  status,
  onOpenEditModal,
  onHandleStatusChange,
  statusContent,
}: ContractStatusSelectProps) => {
  const { onStatusModalOpen } = useContractModalStatusContext();

  return (
    <>
      <Menu>
        <MenuButton
          data-test='contract-menu-dots'
          className={cn(
            `flex items-center max-h-5 p-1 hover:bg-grayModern-100 rounded`,
          )}
        >
          {' '}
          <Icon name='dots-vertical' className='text-grayModern-400' />
        </MenuButton>
        <MenuList align='end' side='bottom' className='p-0'>
          <MenuItem
            onClick={onOpenEditModal}
            className='flex items-center'
            data-test='contract-menu-edit-contract'
          >
            {' '}
            <Icon name='edit-03' className='text-grayModern-500 mr-1' />
            Edit contract
          </MenuItem>

          {status !== ContractStatus.Scheduled && (
            <>
              {status === ContractStatus.Live && (
                <MenuItem
                  className='flex items-center '
                  onClick={() =>
                    onStatusModalOpen(ContractStatusModalMode.Renew)
                  }
                >
                  <Icon
                    name='refresh-ccw-02'
                    className='text-grayModern-500 mr-1'
                  />
                  Renew contract
                </MenuItem>
              )}
              <MenuItem
                className='flex items-center'
                onClick={onHandleStatusChange}
              >
                {statusContent}
              </MenuItem>
            </>
          )}
          {status == ContractStatus.Draft && (
            <MenuItem
              className='flex items-center '
              data-test='contract-menu-delete-contract'
              onClick={() => onStatusModalOpen(ContractStatusModalMode.Delete)}
            >
              <Icon name='trash-01' className='text-grayModern-500 mr-1' />
              Delete contract
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </>
  );
};
