import { useMemo, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { ChooseOrgForOpportunityUsecase } from '@domain/usecases/command-menu/choose-org-for-opportunity.usecase';

import { Avatar } from '@ui/media/Avatar';
import { useStore } from '@shared/hooks/useStore';
import { Command, CommandItem, CommandInput } from '@ui/overlay/CommandMenu';

export const ChooseOpportunityOrganization = observer(() => {
  const store = useStore();

  const usecase = useMemo(
    () => new ChooseOrgForOpportunityUsecase(store),
    [store],
  );

  useEffect(() => {
    if (usecase.searchTerm.length) {
      usecase.searchOrganizations();
    }
  }, [usecase.searchTerm]);

  return (
    <Command shouldFilter={false}>
      <CommandInput
        label='Company'
        value={usecase.searchTerm}
        placeholder='Choose company'
        dataTest='opp-kanban-choose-organization'
        onValueChange={(v) => usecase.setSearchTerm(v)}
      />
      <Command.List>
        {usecase.organizations.map((org) => (
          <CommandItem key={org.id} onSelect={() => usecase.execute(org.id)}>
            <div className='flex items-center'>
              <Avatar
                size='xxs'
                name={org.name}
                className='mr-2'
                variant='outlineSquare'
                src={org.logoUrl ?? ''}
              />
              {org.name}
            </div>
          </CommandItem>
        ))}
      </Command.List>
    </Command>
  );
});
