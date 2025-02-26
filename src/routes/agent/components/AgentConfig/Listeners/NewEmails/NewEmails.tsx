import { useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { NewEmailsUsecase } from '@domain/usecases/agents/listeners/new-emails.usecase';

import { Icon } from '@ui/media/Icon';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { AgentListenerEvent } from '@graphql/types';

import { ConnectedAccount } from './ConnectedAccount';
import { ConnectAccountMenu } from './ConnectAccountMenu';

export const NewEmails = observer(() => {
  const store = useStore();
  const { id } = useParams<{ id: string }>();

  const agent = store.agents.getById(id ?? '');
  const [searchParams, setSearchParams] = useSearchParams();

  const usecase = useMemo(() => {
    return new NewEmailsUsecase(id!);
  }, [id]);

  useEffect(() => {
    const email = searchParams.get('email');

    if (email) {
      const isEmailLinked = usecase.emails.find((item) => item.email === email);

      if (!isEmailLinked) {
        usecase.addLink(email);
        usecase.execute();
      }

      searchParams.delete('email');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, usecase]);

  if (!agent) return null;

  if (!usecase.emails.length) {
    return (
      <div className='px-4 py-3'>
        <h2 className='text-sm font-medium mb-1'>
          {agent.getListenerName(AgentListenerEvent.NewEmail)}
        </h2>
        <p className='text-sm mb-4'>
          Add any workspace accounts or outbound mailboxes that you want this
          agent to monitor
        </p>

        <ConnectAccountMenu usecase={usecase}>
          <Button size='sm' className='w-full' colorScheme='primary'>
            Connect accounts
          </Button>
        </ConnectAccountMenu>
      </div>
    );
  }

  return (
    <div className='px-4 py-3'>
      <div className='flex items-center justify-between mb-1'>
        <h2 className='text-sm font-medium'>
          {agent.getListenerName(AgentListenerEvent.NewEmail) ?? 'New Emails'}
        </h2>
        <ConnectAccountMenu usecase={usecase}>
          <Button
            size='xxs'
            variant='ghost'
            colorScheme='primary'
            leftIcon={<Icon name='plus' />}
          >
            Connect accounts
          </Button>
        </ConnectAccountMenu>
      </div>

      <p className='text-sm mb-4'>
        Add any workspace accounts or outbound mailboxes that you want this
        agent to monitor
      </p>
      {usecase.listenerErrors && (
        <div className='bg-error-50 text-error-700 px-2 py-1 rounded-[4px] mb-4'>
          <Icon stroke='none' className='mr-2' name='dot-single' />
          <span className='text-sm'>{usecase.listenerErrors}</span>
        </div>
      )}
      <div className='flex flex-col gap-2 mb-8'>
        {usecase.emails.map((data, idx) => {
          return (
            <ConnectedAccount
              usecase={usecase}
              email={data.email}
              key={`${data.email}_${idx}`}
            />
          );
        })}
      </div>
    </div>
  );
});
