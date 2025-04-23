import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';

import { cn } from '@ui/utils/cn';
import { useStore } from '@shared/hooks/useStore';

import { relationshipOptions } from './util';

interface OrganizationRelationshipProps {
  id: string;
  dataTest?: string;
}

export const OrganizationRelationshipCell = observer(
  ({ id }: OrganizationRelationshipProps) => {
    const store = useStore();
    const organizationStore = registry.get('organizations');

    const organization = organizationStore.get(id);
    const value = relationshipOptions.find(
      (option) => option.value === organization?.relationship,
    );

    return (
      <div
        className='flex items-center cursor-pointer group/relationship overflow-hidden'
        onClick={() => {
          store.ui.commandMenu.setType('ChangeRelationship');
          store.ui.commandMenu.setOpen(true);
        }}
      >
        <p
          data-test='organization-relationship-in-all-orgs-table'
          className={cn('text-grayModern-700', !value && 'text-grayModern-400')}
        >
          {value?.label
            ? value.label
            : organization?.isEnriching
            ? 'Enriching...'
            : 'Not set'}
        </p>
      </div>
    );
  },
);
