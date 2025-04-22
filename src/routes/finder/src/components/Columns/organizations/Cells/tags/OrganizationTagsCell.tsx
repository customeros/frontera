import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';

import type { Tag } from '@graphql/types';

import { useStore } from '@shared/hooks/useStore';

import { TagsCell } from '../../../shared/Cells';

interface OrganizationTagsCellProps {
  id: string;
}

export const OrganizationsTagsCell = observer(
  ({ id }: OrganizationTagsCellProps) => {
    const store = useStore();
    const organizationStore = registry.get('organizations');
    const entity = organizationStore.get(id);
    const tags = (entity?.tags ?? []).filter((d) => !!d?.name);

    return (
      <div
        className='flex items-center cursor-pointer'
        onClick={() => {
          store.ui.commandMenu.setType('ChangeTags');
          store.ui.commandMenu.setOpen(true);
        }}
      >
        <TagsCell tags={(tags ?? []) as Tag[]} />
      </div>
    );
  },
);
