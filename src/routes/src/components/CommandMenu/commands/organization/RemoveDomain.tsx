import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { OrganizationService } from '@/domain/services';

import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { useModKey } from '@shared/hooks/useModKey';
import {
  Command,
  CommandCancelButton,
  CommandCancelIconButton,
} from '@ui/overlay/CommandMenu';

export const RemoveDomain = observer(() => {
  const { ui } = useStore();
  const context = ui.commandMenu.context;
  const isPrimary = context.meta?.isPrimary;
  const organization = registry
    .get('organizations')
    .get(context.ids?.[0] as string);
  const organizationService = useMemo(() => new OrganizationService(), []);

  useModKey('Enter', () => {
    ui.commandMenu.setOpen(false);
  });

  const handleConfirm = () => {
    if (!organization) return;
    organizationService.removeDomain(organization, context?.meta?.domain);
    ui.commandMenu.setOpen(false);
  };

  const handleClose = () => {
    ui.commandMenu.toggle('ConfirmSingleFlowEdit');
    ui.commandMenu.clearCallback();
  };

  return (
    <Command shouldFilter={false}>
      <article className='relative w-full p-6 flex flex-col border-b border-b-grayModern-100 cursor-default'>
        <div className='flex justify-between'>
          <h1 className='text-base font-semibold'>
            Remove this {isPrimary ? 'domain' : 'subdomain'}
          </h1>
          <div>
            <CommandCancelIconButton onClose={handleClose} />
          </div>
        </div>
        <p className='mt-2 text-sm'>
          {isPrimary
            ? `Removing ${context?.meta?.domain}, will also remove any related
            subdomains`
            : `Removing ${context?.meta?.domain} will not remove its associated primary domain`}
        </p>

        <div className='flex justify-between gap-3 mt-6'>
          <CommandCancelButton onClose={handleClose} />

          <Button
            size='sm'
            variant='outline'
            className='w-full'
            colorScheme='error'
            onClick={handleConfirm}
            dataTest={'remove-domain'}
            data-test='contact-actions-confirm-flow-change'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          >
            Remove
          </Button>
        </div>
      </article>
    </Command>
  );
});
