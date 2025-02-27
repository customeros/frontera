import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { SyncInvoiceToAccountingUsecase } from '@domain/usecases/agents/capabilities/sync-invoice-to-accounting.usecase';

import { cn } from '@ui/utils/cn';
import { Logo } from '@ui/media/Logo';
import { Icon } from '@ui/media/Icon';
import { Switch } from '@ui/form/Switch';
import { Spinner } from '@ui/feedback/Spinner';
import { Button } from '@ui/form/Button/Button';
import { ButtonGroup } from '@ui/form/ButtonGroup';
import { ConfirmDeleteDialog } from '@ui/overlay/AlertDialog/ConfirmDeleteDialog';

export const SyncInvoiceToAccounting = observer(() => {
  const { id } = useParams<{ id: string }>();
  const usecase = useMemo(() => new SyncInvoiceToAccountingUsecase(id!), [id]);

  useEffect(() => {
    usecase.init();
  }, []);

  return (
    <div className='px-4 py-3'>
      <div className='flex items-center justify-between mb-1'>
        <h1 className='text-sm font-medium'>{usecase.capabilityName}</h1>

        <Switch
          size='sm'
          checked={usecase.isEnabled}
          onChange={usecase.toggleEnabled}
        />
      </div>
      <p className='text-sm mb-4'>
        Automatically sync your invoice line items from CustomerOS to quickbooks
      </p>
      {!usecase.isQuickbooksConnected && (
        <Button
          variant='outline'
          className='w-full'
          colorScheme='primary'
          onClick={usecase.execute}
          loadingText='Connecting...'
          isLoading={usecase.isConnecting}
          rightSpinner={
            <Spinner
              label='Connecting...'
              className='text-primary-300 fill-primary-700 size-4'
            />
          }
        >
          Connect Quickbooks
        </Button>
      )}
      {usecase.isQuickbooksConnected && (
        <>
          <div className='flex items-center gap-2 justify-between'>
            <div className='flex items-center gap-2'>
              <Logo name='quickbooks' className='size-5' />
              <p className='text-sm font-medium'>Quickbooks</p>
            </div>

            <div className='flex items-center gap-1'>
              <Button
                size='xxs'
                variant='ghost'
                isLoading={usecase.isRevoking}
                loadingText='Disconnecting...'
                onClick={usecase.toggleRevokeOpen}
                rightSpinner={
                  <Spinner
                    label='Disconnecting...'
                    className='text-primary-300 fill-primary-700 size-3'
                  />
                }
              >
                <Icon stroke='none' name='dot-live-success' />
                <p className='text-xs font-medium'>Connected</p>
              </Button>
            </div>
          </div>

          <div className='mt-3 flex justify-between'>
            <div className='flex justify-center gap-2 items-center pl-7'>
              <label className='text-sm font-medium'>Accounting method</label>
            </div>
            <ButtonGroup className='w-fit'>
              <Button
                size='xxs'
                onClick={usecase.toggleAccountingMethod}
                className={cn(
                  usecase.accountingMethod === 'cash' && 'selected',
                )}
              >
                Cash basis
              </Button>
              <Button
                size='xxs'
                onClick={usecase.toggleAccountingMethod}
                className={cn(
                  usecase.accountingMethod === 'accrual' && 'selected',
                )}
              >
                Accrual
              </Button>
            </ButtonGroup>
          </div>
        </>
      )}

      <ConfirmDeleteDialog
        onConfirm={usecase.execute}
        isOpen={usecase.isRevokeOpen}
        label='Disconnect Quickbooks'
        isLoading={usecase.isRevoking}
        confirmButtonLabel='Disconnect'
        onClose={usecase.toggleRevokeOpen}
        body={
          <p className='text-sm'>
            Disconnecting Quickbooks will{' '}
            <span className='font-medium'>revoke its access</span> to your
            workspace. This means that any part of the app that relies on it,
            including agent capabilities, will stop working.
          </p>
        }
      />
    </div>
  );
});
