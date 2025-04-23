import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { Organization } from '@domain/entities';
import { registry } from '@domain/stores/registry';
import { OrganizationService } from '@domain/services';

import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import {
  Command,
  CommandCancelButton,
  CommandCancelIconButton,
} from '@ui/overlay/CommandMenu';

export const MergeConfirmationModal = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const organizationStore = registry.get('organizations');
  const organizationService = useMemo(() => new OrganizationService(), []);

  const handleClose = () => {
    store.ui.commandMenu.toggle('MergeConfirmationModal');
    store.ui.commandMenu.clearContext();
  };

  const handleConfirm = () => {
    const [primary, ...rest] = context.ids as string[];

    const targetOrg = organizationStore.get(primary);

    if (!targetOrg) return;

    organizationService.merge(
      targetOrg,
      rest
        .map((id) => organizationStore.get(id))
        .filter(Boolean) as Organization[],
    );

    handleClose();
  };

  return (
    <Command>
      <article className='relative w-full p-6 flex flex-col border-b border-b-grayModern-100'>
        <div className='flex items-center justify-between'>
          <h1 className='text-base font-semibold'>
            Merge {context.ids?.length} companies?
          </h1>
          <CommandCancelIconButton onClose={handleClose} />
        </div>

        <div className='flex justify-between gap-3 mt-6'>
          <CommandCancelButton onClose={handleClose} />

          <Button
            size='sm'
            variant='outline'
            className='w-full'
            colorScheme='error'
            onClick={handleConfirm}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          >
            Merge
          </Button>
        </div>
      </article>
    </Command>
  );
});
