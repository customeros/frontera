import { useMemo } from 'react';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { Organization } from '@/domain/entities';
import { registry } from '@/domain/stores/registry';
import { OrganizationService } from '@/domain/services/organization/organizations.service';

import { Check } from '@ui/media/icons/Check';
import { useStore } from '@shared/hooks/useStore';
import { OpportunityRenewalLikelihood } from '@graphql/types';
import { Command, CommandItem, CommandInput } from '@ui/overlay/CommandMenu';

export const UpdateHealthStatus = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const organizationStore = registry.get('organizations');
  const organizationService = useMemo(() => new OrganizationService(), []);

  const entity = match(context.entity)
    .returnType<Organization | Organization[] | undefined>()

    .with('Organization', () =>
      organizationStore.get(context.ids?.[0] as string),
    )
    .with(
      'Organizations',
      () =>
        context.ids?.map((e: string) =>
          organizationStore.get(e),
        ) as Organization[],
    )
    .otherwise(() => undefined);

  const label = match(context.entity)
    .with('Organization', () => `Company - ${(entity as Organization)?.name}`)
    .with('Organizations', () => `${context.ids?.length} companies`)

    .otherwise(() => '');

  const handleSelect =
    (renewalLikelihood: OpportunityRenewalLikelihood) => () => {
      if (!context.ids?.[0]) return;

      if (!entity) return;

      match(context.entity)
        .with('Organization', () => {
          organizationService.setHealth(
            entity as Organization,
            renewalLikelihood,
          );
        })
        .with('Organizations', () => {
          (context.ids as string[]).forEach((id) => {
            const org = organizationStore.get(id);

            if (!org) return;
            organizationService.setHealth(org, renewalLikelihood);
          });
        })
        .otherwise(() => undefined);

      store.ui.commandMenu.toggle('UpdateHealthStatus');
    };

  const healthStatus =
    context.entity === 'Organization' &&
    (entity as Organization)?.renewalSummaryRenewalLikelihood;

  return (
    <Command label='Change health status...'>
      <CommandInput
        label={label}
        placeholder='Change health status...'
        onKeyDownCapture={(e) => {
          if (e.metaKey && e.key === 'Enter') {
            store.ui.commandMenu.setOpen(false);
          }
        }}
      />

      <Command.List>
        <CommandItem
          key={OpportunityRenewalLikelihood.HighRenewal}
          onSelect={handleSelect(OpportunityRenewalLikelihood.HighRenewal)}
          rightAccessory={
            healthStatus === OpportunityRenewalLikelihood.HighRenewal ? (
              <Check />
            ) : null
          }
        >
          <span className='text-greenLight-500'>High</span>
        </CommandItem>
        <CommandItem
          key={OpportunityRenewalLikelihood.MediumRenewal}
          onSelect={handleSelect(OpportunityRenewalLikelihood.MediumRenewal)}
          rightAccessory={
            healthStatus === OpportunityRenewalLikelihood.MediumRenewal ? (
              <Check />
            ) : null
          }
        >
          <span className='text-warning-500'>Medium</span>
        </CommandItem>
        <CommandItem
          key={OpportunityRenewalLikelihood.LowRenewal}
          onSelect={handleSelect(OpportunityRenewalLikelihood.LowRenewal)}
          rightAccessory={
            healthStatus === OpportunityRenewalLikelihood.LowRenewal ? (
              <Check />
            ) : null
          }
        >
          <span className='text-error-500'>Low</span>
        </CommandItem>
      </Command.List>
    </Command>
  );
});
