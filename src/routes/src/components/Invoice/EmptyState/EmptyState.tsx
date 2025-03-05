import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { CreateAgentUsecase } from '@domain/usecases/agents/create-agent.usecase';

import { Icon } from '@ui/media/Icon';
import { AgentType } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';
import { Button } from '@ui/form/Button/Button.tsx';
import { FeaturedIcon } from '@ui/media/Icon/FeaturedIcon';

import HalfCirclePattern from '../../../assets/HalfCirclePattern';

export const EmptyState = observer(
  ({ companyName, id }: { id: string; companyName: string }) => {
    const store = useStore();
    const navigate = useNavigate();

    const cashflowAgent = store.agents.getFirstAgentByType(
      AgentType.CashflowGuardian,
    )?.value;

    const navigateToAgent = (id: string) => {
      navigate(`/agents/${id}`);
    };

    const usecase = useMemo(() => new CreateAgentUsecase(navigateToAgent), []);

    const handleAgentNavigation = () => {
      if (!cashflowAgent) {
        return usecase.execute(AgentType.CashflowGuardian);
      }

      return navigate(`/agents/${cashflowAgent.id}`);
    };

    const navigateToAccount = () => {
      navigate(`/organization/${id}?tab=account`);
    };

    return (
      <div className='flex flex-col h-full w-full max-w-[448px]'>
        <div className='flex relative'>
          <FeaturedIcon
            size='lg'
            colorScheme='grayModern'
            className='absolute top-[26%] justify-self-center right-0 left-0'
          >
            <Icon name='invoice' />
          </FeaturedIcon>
          <HalfCirclePattern />
        </div>
        <div className='flex flex-col text-center items-center translate-y-[-212px]'>
          <p className='text-grayModern-700 text-md font-semibold mb-1'>
            No paper trails yet
          </p>
          <p className='text-sm my-1 max-w-[360px] text-center'>
            {cashflowAgent?.isActive ? (
              <>
                <p>
                  Invoices sent to {companyName} will appear here once processed
                  by the{' '}
                  <span
                    onClick={handleAgentNavigation}
                    className='cursor-pointer underline'
                  >
                    Cashflow Guardian
                  </span>{' '}
                  agent.
                </p>
                <p className='mt-4'>
                  To send invoices, add products to this company’s contract and
                  complete their billing details.
                </p>
              </>
            ) : (
              <>
                <span>To start sending invoices, enable the </span>
                <span
                  onClick={handleAgentNavigation}
                  className='cursor-pointer underline'
                >
                  Cashflow Guardian
                </span>
                <span>
                  {' '}
                  agent, add products to {companyName}'s contract, and complete
                  their billing details.
                </span>
              </>
            )}
          </p>
          <Button
            variant='outline'
            colorScheme='primary'
            className='mt-6 min-w-min text-sm '
            dataTest={'empty-state-add-invoice'}
            onClick={() => {
              if (!cashflowAgent?.isActive) {
                if (cashflowAgent && cashflowAgent?.id) {
                  navigate(`/agents/${cashflowAgent.id}`);

                  return;
                }

                if (cashflowAgent) {
                  navigate(`/agents`);

                  return;
                }
              }

              if (!cashflowAgent) {
                handleAgentNavigation();
              }

              if (cashflowAgent?.isActive) {
                navigateToAccount();
              }
            }}
          >
            {cashflowAgent?.isActive
              ? 'Go to account'
              : 'Enable Cashflow Guardian'}
          </Button>
        </div>
      </div>
    );
  },
);
