import React from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';

interface ContractStartModalProps {
  contractId: string;
  onClose: () => void;
}

export const ContractDeleteModal = observer(
  ({ onClose, contractId }: ContractStartModalProps) => {
    const store = useStore();
    const organizationId = useParams()?.id as string;

    const handleDeleteContract = () => {
      const contractsStore = store.contracts;

      contractsStore.delete(contractId, organizationId);

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
              <h1 className={cn('text-base font-semibold')}>
                Delete this contract?
              </h1>
            </div>
            <div className='flex flex-col'>
              <p className='text-sm mt-3'>
                Are you sure you want to delete this contract?
              </p>
            </div>
          </div>

          <div className='mt-6 flex'>
            <Button
              size='sm'
              variant='outline'
              onClick={onClose}
              className='w-full'
            >
              Cancel
            </Button>
            <Button
              size='sm'
              variant='outline'
              colorScheme='error'
              className='ml-3 w-full'
              onClick={handleDeleteContract}
              dataTest='contract-card-confirm-contract-deletion'
            >
              Delete contract
            </Button>
          </div>
        </div>
      </>
    );
  },
);
