import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateAgentUsecase } from '@domain/usecases/agents/create-agent.usecase';

import { Icon } from '@ui/media/Icon';
import { AgentType } from '@graphql/types';
import { Command, CommandItem, CommandInput } from '@ui/overlay/CommandMenu';

export const CreateAgent = () => {
  const navigate = useNavigate();

  const navigateToAgent = (id: string) => {
    navigate(`/agents/${id}`);
  };
  const usecase = useMemo(() => new CreateAgentUsecase(navigateToAgent), []);

  return (
    <Command>
      <CommandInput
        label='Add a new agent'
        placeholder='Search for an agent...'
      />
      <Command.List>
        <CommandItem
          onSelect={() => usecase.execute(AgentType.WebVisitIdentifier)}
        >
          <Icon name='radar' />
          <span>Web Visitor Identifier</span>
        </CommandItem>
        <CommandItem onSelect={() => usecase.execute(AgentType.IcpQualifier)}>
          <Icon name='target-04' />
          <span>ICP Qualifier</span>
        </CommandItem>
        <CommandItem onSelect={() => usecase.execute(AgentType.MeetingKeeper)}>
          <Icon name='edit-04' />
          <span>Meeting Keeper</span>
        </CommandItem>
        <CommandItem onSelect={() => usecase.execute(AgentType.SupportSpotter)}>
          <Icon name='life-buoy-01' />
          <span>Support Spotter</span>
        </CommandItem>
        <CommandItem
          onSelect={() => usecase.execute(AgentType.CashflowGuardian)}
        >
          <Icon name='shield-dollar' />
          <span>Cashflow Guardian</span>
        </CommandItem>
      </Command.List>
    </Command>
  );
};
