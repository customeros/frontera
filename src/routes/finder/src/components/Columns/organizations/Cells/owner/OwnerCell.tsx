import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { useStore } from '@shared/hooks/useStore';

interface OwnerProps {
  ownerId?: string;
}

export const OwnerCell = observer(({ ownerId }: OwnerProps) => {
  const store = useStore();
  const userOwner = store.users.value.get(ownerId ?? '');

  return (
    <div
      data-test='organization-owner-in-all-orgs-table'
      onClick={() => {
        store.ui.commandMenu.setType('AssignOwner');
        store.ui.commandMenu.setOpen(true);
      }}
      className={cn(
        'inline w-full gap-1 items-center cursor-pointer truncate',
        ownerId ? 'text-grayModern-700' : 'text-grayModern-400',
      )}
    >
      {userOwner?.name ?? 'No owner'}
    </div>
  );
});
