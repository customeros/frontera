import { useNavigate, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';

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
    const [searchParams, setSearchParams] = useSearchParams();

    const [lastActivePosition, setLastActivePosition] = useLocalStorage(
      `customeros-player-last-position`,
      { [id as string]: 'tab=invoices' },
    );

    const cashflowAgent = store.agents.getFirstAgentByType(
      AgentType.CashflowGuardian,
    )?.value;

    const navigateToAccount = () => {
      const urlSearchParams = new URLSearchParams(searchParams?.toString());

      urlSearchParams.set('tab', 'account');

      setLastActivePosition({
        ...lastActivePosition,
        [id as string]: urlSearchParams.toString(),
      });
      setSearchParams(urlSearchParams);
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
            No upcoming invoices
          </p>
          <p className='text-sm my-1 max-w-[360px] text-center'>
            {cashflowAgent?.isActive
              ? `Invoices sent to ${companyName} will appear here once processed by the Cashflow Guardian agent. To send invoices, add products to this company’s contract and complete their billing details.`
              : `To start sending invoices, enable the Cashflow Guardian agent, add products to ${companyName}’s contract, and complete their billing details.`}
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
