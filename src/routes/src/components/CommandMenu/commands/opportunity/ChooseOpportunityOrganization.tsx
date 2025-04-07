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
          <CommandItem
            key={org.value.id}
            onSelect={() => usecase.execute(org.value.id)}
          >
            <div className='flex items-center'>
              <Avatar
                size='xxs'
                className='mr-2'
                name={org.value?.name}
                variant='outlineSquare'
                src={org.value.logoUrl ?? ''}
              />
              {org.value.name}
            </div>
          </CommandItem>
        ))}
      </Command.List>
    </Command>
  );
});
