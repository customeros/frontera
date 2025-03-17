import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDidUpdate } from 'rooks';
import { observer } from 'mobx-react-lite';
import { useConnections, useIntegrationApp } from '@integration-app/react';
import { ManageOnlinePaymentUsecase } from '@domain/usecases/agents/capabilities/manage-online-payment.usecase';

import { Logo } from '@ui/media/Logo';
import { Icon } from '@ui/media/Icon';
import { Spinner } from '@ui/feedback/Spinner';
import { Button } from '@ui/form/Button/Button';
import { Switch } from '@ui/form/Switch/Switch';
import { toastError } from '@ui/presentation/Toast';
import { ConfirmDeleteDialog } from '@ui/overlay/AlertDialog/ConfirmDeleteDialog';

export const ManageOnlinePayment = observer(() => {
  const { id } = useParams<{ id: string }>();

  const usecase = useMemo(() => new ManageOnlinePaymentUsecase(id!), [id]);

  const iApp = useIntegrationApp();
  const { items: iConnections, refresh } = useConnections();
  const isStripeActive = !!iConnections
    .map((item) => item.integration?.key)
    .find((e) => e === 'stripe');

  const handleOpenIntegrationAppModal = async () => {
    try {
      usecase.setIsConnecting(true);
      await iApp.integration('stripe').open({
        showPoweredBy: false,
        onClose: () => {
          usecase.setIsConnecting(false);
        },
      });
      await refresh();
    } catch (err) {
      toastError('Integration failed', 'get-intergration-data');
    }
  };

  useDidUpdate(() => {
    if (!isStripeActive) {
      usecase.toggleCapability(false);
    }
  }, [isStripeActive]);

  return (
    <div className='px-4 py-3'>
      <div className='flex items-center justify-between mb-1'>
        <h1 className='text-sm font-medium'>{usecase.capabilityName}</h1>
        <Switch
          size='sm'
          isChecked={usecase.capability?.active}
          onChange={
            !isStripeActive
              ? () => {}
              : () => {
                  if (usecase.capability?.active) {
                    usecase.setIsDisableDialogOpen(true);
                  } else {
                    usecase.execute();
                  }
                }
          }
        />
      </div>
      <p className='text-sm mb-4'>
        Invoices will be automatically charged via Stripe. If auto-payment is
        not possible, we’ll send a payment link via email.
      </p>

      {!isStripeActive && (
        <Button
          variant='outline'
          className='w-full'
          colorScheme='primary'
          loadingText='Connecting...'
          isLoading={usecase.isConnecting}
          onClick={handleOpenIntegrationAppModal}
          rightSpinner={
            <Spinner
              label='Connecting...'
              className='text-primary-300 fill-primary-700 size-4'
            />
          }
        >
          Connect Stripe
        </Button>
      )}
      {isStripeActive && (
        <div className='flex flex-col gap-2 w-full'>
          <label className='text-sm font-medium'>
            Customers can pay with...
          </label>

          <div className='flex items-center gap-2 justify-between'>
            <div className='flex items-center gap-2'>
              <Logo name='stripe' className='size-5' />
              <p className='text-sm'>
                <span className='font-medium'>Stripe • </span>Credit or Debit
                cards
              </p>
            </div>

            <div className='flex items-center gap-1'>
              <Button
                size='xxs'
                variant='ghost'
                onClick={handleOpenIntegrationAppModal}
              >
                <Icon stroke='none' name='dot-live-success' />
                <p className='text-xs font-medium'>Connected</p>
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        cancelButtonLabel='Cancel'
        confirmButtonLabel='Disable'
        label='Disable online payments'
        isOpen={usecase.isDisableDialogOpen}
        onClose={() => usecase.setIsDisableDialogOpen(false)}
        onConfirm={() => {
          usecase.execute();
          usecase.setIsDisableDialogOpen(false);
        }}
        body={
          <p className='text-sm'>
            If you disable online payments, invoices will no longer <br />
            be auto-charged, and payment links will not be included
            <br /> with invoices.
          </p>
        }
      />
    </div>
  );
});
