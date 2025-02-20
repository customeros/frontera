import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useConnections } from '@integration-app/react';
import { useIntegrationApp } from '@integration-app/react';
import { ManageOnlinePaymentUsecase } from '@domain/usecases/agents/capabilities/manage-online-payment.usecase';

import { Spinner } from '@ui/feedback/Spinner';
import { Button } from '@ui/form/Button/Button';
import { Switch } from '@ui/form/Switch/Switch';
import { toastError } from '@ui/presentation/Toast';

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
      await iApp
        .flowInstance({
          flowKey: 'stripe-default-flow-v1',
          integrationKey: 'stripe',
          autoCreate: false,
        })
        .run({
          nodeKey: 'manual-sync-payment-methods',
        });
    } catch (err) {
      // handle different errors
      toastError('Integration failed', 'get-intergration-data');
    }
  };

  return (
    <div className='px-4 py-3'>
      <div className='flex items-center justify-between mb-1'>
        <h1 className='text-sm font-medium'>{usecase.capabilityName}</h1>
        <Switch
          size='sm'
          isChecked={usecase.isEnabled}
          onChange={usecase.toggleCapability}
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
    </div>
  );
});
