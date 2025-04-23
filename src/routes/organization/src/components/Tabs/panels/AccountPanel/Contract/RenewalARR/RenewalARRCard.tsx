import { useParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { registry } from '@domain/stores/registry';
import { ContractStore } from '@store/Contracts/Contract.store.ts';

import { cn } from '@ui/utils/cn';
import { DateTimeUtils } from '@utils/date';
import { useStore } from '@shared/hooks/useStore';
import { FeaturedIcon } from '@ui/media/Icon/FeaturedIcon';
import { Card, CardHeader } from '@ui/presentation/Card/Card';
import { formatCurrency } from '@utils/getFormattedCurrencyNumber';
import { ClockFastForward } from '@ui/media/icons/ClockFastForward';
import { InfoDialog } from '@ui/overlay/AlertDialog/InfoDialog/InfoDialog';
import {
  Opportunity,
  InternalStage,
  OpportunityRenewalLikelihood,
} from '@graphql/types';
import { useUpdateRenewalDetailsContext } from '@organization/components/Tabs/panels/AccountPanel/context/AccountModalsContext';
import { RenewalDetailsModal } from '@organization/components/Tabs/panels/AccountPanel/Contract/RenewalARR/RenewalDetailsModal';

import { getRenewalLikelihoodLabel } from '../../utils';

interface RenewalARRCardProps {
  hasEnded: boolean;
  startedAt: string;
  contractId: string;
  opportunityId: string;
  currency?: string | null;
}
export const RenewalARRCard = observer(
  ({
    startedAt,
    hasEnded,
    opportunityId,
    currency,
    contractId,
  }: RenewalARRCardProps) => {
    const store = useStore();
    const id = useParams()?.id as string;
    const contractStore = store.contracts.value.get(
      contractId,
    ) as ContractStore;

    const opportunityStore = store.opportunities.value.get(opportunityId);
    const opportunity = opportunityStore?.value;
    const { modal } = useUpdateRenewalDetailsContext();
    const [isLocalOpen, setIsLocalOpen] = useState(false);
    const organizationStore = registry.get('organizations');

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateOpportunityMutation = (input: Partial<Opportunity>) => {
      if (opportunity?.maxAmount) {
        opportunityStore?.update(
          (prev) =>
            ({
              ...prev,
              amount:
                (opportunity?.maxAmount * input.renewalAdjustedRate) / 100,
            } as Opportunity),
        );
      }

      opportunityStore?.update(
        (prev) =>
          ({
            ...prev,
            ...input,
          } as Opportunity),
      );

      setTimeout(() => {
        // needed for now because contract opportunities don't have org data (org comes as null)

        organizationStore?.revalidate(id);
      }, 1500);
      modal.onClose();
    };

    const maxAmountValue = Number(opportunity?.maxAmount ?? 0);
    const formattedMaxAmount = !isNaN(maxAmountValue)
      ? formatCurrency(maxAmountValue, 2, currency || 'USD')
      : formatCurrency(0, 2, currency || 'USD');

    const amountValue = Number(hasEnded ? 0 : opportunity?.amount ?? 0);
    const formattedAmount = !isNaN(amountValue)
      ? formatCurrency(amountValue, 2, currency || 'USD')
      : formatCurrency(0, 2, currency || 'USD');
    const hasRewenewChanged = formattedMaxAmount !== formattedAmount;

    const hasRenewalLikelihoodZero =
      opportunity?.renewalLikelihood ===
      OpportunityRenewalLikelihood.ZeroRenewal;
    const timeToRenewal = DateTimeUtils.getDifferenceFromNow(
      opportunity?.renewedAt,
    ).join(' ');

    const showTimeToRenewal =
      !hasEnded &&
      opportunity?.renewedAt &&
      startedAt &&
      !DateTimeUtils.isPast(opportunity?.renewedAt);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    if (!opportunity) return null;

    return (
      <>
        <Card
          onClick={() => {
            if (opportunity?.internalStage === InternalStage.ClosedLost) return;
            modal.onOpen();
            setIsLocalOpen(true);
          }}
          className={cn(
            'px-4 py-3 w-full my-2 border border-grayModern-200 relative bg-white rounded-lg shadow-xs',
            {
              'cursor-pointer': !hasEnded,
              'cursor-default': hasEnded,
            },
          )}
        >
          <CardHeader className='flex items-center justify-between w-full gap-4'>
            <FeaturedIcon size='md' colorScheme='primary' className='ml-2 mr-2'>
              <ClockFastForward />
            </FeaturedIcon>
            <div className='flex items-center justify-between w-full'>
              <div className='flex flex-col'>
                <div className='flex flex-1 items-center'>
                  <h1 className='text-grayModern-700 font-semibold text-sm line-height-1'>
                    Renewal ARR
                  </h1>

                  {showTimeToRenewal && (
                    <p className='ml-1 text-grayModern-500 text-sm inline'>
                      {timeToRenewal}
                    </p>
                  )}
                </div>

                {opportunity?.renewalLikelihood && (
                  <p className='w-full text-grayModern-500 text-sm line-height-1'>
                    {!hasEnded ? (
                      <>
                        Likelihood{' '}
                        <span
                          className={cn(
                            `capitalize font-medium text-grayModern-500`,
                            {
                              'text-greenLight-500':
                                opportunity?.renewalLikelihood ===
                                OpportunityRenewalLikelihood.HighRenewal,
                              'text-orangeDark-800':
                                opportunity?.renewalLikelihood ===
                                OpportunityRenewalLikelihood.LowRenewal,
                              'text-yellow-500':
                                opportunity?.renewalLikelihood ===
                                OpportunityRenewalLikelihood.MediumRenewal,
                            },
                          )}
                        >
                          {getRenewalLikelihoodLabel(
                            opportunity?.renewalLikelihood as OpportunityRenewalLikelihood,
                          )}
                        </span>
                      </>
                    ) : (
                      'Closed lost'
                    )}
                  </p>
                )}
              </div>

              <div>
                <p
                  className={cn('font-semibold', {
                    'animate-pulse': contractStore?.isLoading,
                  })}
                >
                  {opportunity?.renewalLikelihood ===
                  OpportunityRenewalLikelihood.ZeroRenewal
                    ? 0
                    : formattedAmount}
                </p>

                {hasRewenewChanged && (
                  <p
                    className={cn('text-sm text-right line-through', {
                      'animate-pulse': contractStore?.isLoading,
                    })}
                  >
                    {formattedMaxAmount}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {hasRenewalLikelihoodZero ? (
          <InfoDialog
            onClose={modal.onClose}
            onConfirm={modal.onClose}
            confirmButtonLabel='Got it'
            label='This contract ends soon'
            isOpen={modal.open && isLocalOpen}
            description=' The renewal likelihood has been downgraded to Zero because the
          contract is set to end within the current renewal cycle.'
          />
        ) : (
          <RenewalDetailsModal
            data={opportunity}
            currency={currency}
            isOpen={modal.open && isLocalOpen}
            updateOpportunityMutation={updateOpportunityMutation}
            onClose={() => {
              modal.onClose();
              setIsLocalOpen(false);
            }}
          />
        )}
      </>
    );
  },
);
