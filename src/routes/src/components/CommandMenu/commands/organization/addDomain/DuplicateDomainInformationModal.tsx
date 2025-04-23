import { useRef, useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { OrganizationService } from '@domain/services';

import { cn } from '@ui/utils/cn';
import { useStore } from '@shared/hooks/useStore';
import { Button } from '@ui/form/Button/Button.tsx';
import { useModKey } from '@shared/hooks/useModKey';
import {
  CommandCancelButton,
  CommandCancelIconButton,
} from '@ui/overlay/CommandMenu';

export const DuplicateDomainInformation = observer(
  ({
    domain,
    associatedOrg,
    onClose,
    isOpen,
  }: {
    domain?: string;
    isOpen: boolean;
    onClose: () => void;
    associatedOrg?: {
      id: string;
      name: string;
    } | null;
  }) => {
    const { ui } = useStore();
    const organizationStore = registry.get('organizations');
    const context = ui.commandMenu.context;
    const organization = organizationStore.get(context.ids?.[0]);
    const organizationService = useMemo(() => new OrganizationService(), []);

    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const editedOrgName = organizationStore.get(context.ids[0])?.name;

    const handleConfirm = async () => {
      if (!organization) return;
      if (!associatedOrg) return;

      const sourceOrganization = organizationStore.get(associatedOrg.id);

      if (!sourceOrganization) return;

      organizationService.merge(organization, [sourceOrganization]);
      onClose();
    };

    useModKey('Enter', () => {
      ui.commandMenu.setOpen(false);
    });

    return (
      <article
        className={cn(
          'opacity-0 absolute w-[450px] top-[4%] translate-y-[50%] rounded-md p-6 flex flex-col border border-grayModern-200 bg-white cursor-default',
          'shadow-xl transition-all duration-200 ease-in-out',
          'animate-in fade-in slide-in-from-bottom-4',
          'transition-opacity duration-200',
          'transition-transform duration-500',
          {
            'opacity-100 translate-y-0': isOpen,
          },
        )}
      >
        {' '}
        <div className='flex justify-between'>
          <h1 className='text-base font-semibold'>Domain already exists</h1>
          <div>
            <CommandCancelIconButton onClose={onClose} />
          </div>
        </div>
        <p className='mt-3 text-sm'>
          <span className='font-medium mr-1 '>{domain},</span>
          is already associated with another existing company,
          <span className='font-medium mx-1'>{associatedOrg?.name}.</span>
        </p>
        <p className='mt-3 text-sm'>
          Would you like to merge
          <span className='font-medium mx-1'>{associatedOrg?.name}</span>
          into <span className='font-medium'>{editedOrgName}?</span>
        </p>
        <div className='flex justify-between gap-3 mt-6'>
          <CommandCancelButton onClose={onClose} ref={closeButtonRef} />

          <Button
            size='sm'
            variant='outline'
            className='w-full'
            colorScheme='primary'
            ref={confirmButtonRef}
            onClick={handleConfirm}
            dataTest={'merge-organizations'}
            data-test='contact-actions-confirm-flow-change'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          >
            Merge companies
          </Button>
        </div>
      </article>
    );
  },
);
