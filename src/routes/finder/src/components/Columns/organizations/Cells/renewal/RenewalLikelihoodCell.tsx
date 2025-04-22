import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';

import { cn } from '@ui/utils/cn';
import { useStore } from '@shared/hooks/useStore';

import { getLikelihoodColor, getRenewalLikelihoodLabel } from './utils';

interface RenewalLikelihoodCellProps {
  id: string;
}

export const RenewalLikelihoodCell = observer(
  ({ id }: RenewalLikelihoodCellProps) => {
    const store = useStore();
    const organizationStore = registry.get('organizations');
    const organization = organizationStore.get(id);
    const value = organization?.renewalSummaryRenewalLikelihood;

    const colors = value ? getLikelihoodColor(value) : 'text-grayModern-400';

    if (!organization) return null;

    const canUpdate = organization.contracts?.length;

    return (
      <div
        className={cn(
          'flex gap-1 items-center cursor-default group/likelihood',
          {
            'cursor-pointer': canUpdate,
          },
        )}
        onClick={() => {
          if (canUpdate) {
            store.ui.commandMenu.setType('UpdateHealthStatus');
            store.ui.commandMenu.setOpen(true);
          }
        }}
      >
        <span
          className={cn(colors)}
          data-test='organization-health-in-all-orgs-table'
        >
          {value ? getRenewalLikelihoodLabel(value) : 'No set'}
        </span>
      </div>
    );
  },
);
