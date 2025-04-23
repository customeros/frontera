import { useRef, useMemo, useState, useEffect } from 'react';

import { useKeyBindings } from 'rooks';
import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { AddOrganizationDomainCase } from '@domain/usecases/command-menu/organization/add-organization-domain.usecase';

import { cn } from '@ui/utils/cn';
import { Input } from '@ui/form/Input';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { useModKey } from '@shared/hooks/useModKey';
import {
  Command,
  CommandCancelButton,
  CommandCancelIconButton,
} from '@ui/overlay/CommandMenu';

import { DuplicateDomainInformation } from './DuplicateDomainInformationModal';

export const AddNewDomain = observer(() => {
  const { ui } = useStore();
  const context = ui.commandMenu.context;
  const organization = registry
    .get('organizations')
    .get(context.ids?.[0] as string);
  const [showDuplicateInfo, setShowDuplicateInfo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addNewDomainUsecase = useMemo(
    () => organization && new AddOrganizationDomainCase(organization),
    [organization],
  );

  const handleConfirm = async () => {
    addNewDomainUsecase?.resetValidation();
    addNewDomainUsecase?.checkIfEmpty();

    await addNewDomainUsecase?.validateDomain();

    if (addNewDomainUsecase?.error) {
      if (addNewDomainUsecase?.associatedOrg) {
        setShowDuplicateInfo(true);
      }

      return;
    }

    addNewDomainUsecase?.submit();
    ui.commandMenu.setOpen(false);
  };

  useModKey('Enter', () => {
    ui.commandMenu.setOpen(false);
  });

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }, 0);

    return () => clearTimeout(focusTimer);
  }, []); // Run only on mount

  const handleClose = () => {
    addNewDomainUsecase?.reset();
    ui.commandMenu.toggle('AddNewDomain');
    ui.commandMenu.clearCallback();
  };

  useKeyBindings({
    Escape: handleClose,
  });

  return (
    <Command shouldFilter={false} className={'!w-auto'}>
      <article
        className={cn(
          'relative w-full p-6 flex flex-col border-b border-b-grayModern-100 cursor-default bg-white',
          'transition transform duration-500 ease-in-out origin-top translate-y-0 opacity-100 scale-100 z-50',
          {
            'absolute bg-white rounded-md scale-[0.80] opacity-90 -translate-y-2 transition transform duration-500 z-1':
              showDuplicateInfo,
          },
        )}
      >
        <>
          <div className='flex justify-between'>
            <h1 className='text-base font-semibold'>Add new domain</h1>
            <div>
              <CommandCancelIconButton onClose={handleClose} />
            </div>
          </div>
          <p className='mt-1 text-sm'>
            Domains that redirect will appear as subdomains of their primary
            domain
          </p>

          <div className={'mt-4'}>
            <Input
              autoFocus
              size={'sm'}
              ref={inputRef}
              dataTest='add-domain-input'
              placeholder='Company’s domain'
              value={addNewDomainUsecase?.inputValue}
              onChange={(e) => {
                addNewDomainUsecase?.setInputValue(e.target.value);
              }}
              className={cn({
                'border-error-600 hover:!border-error-600 focus:!border-error-600 active:!border-error-600':
                  addNewDomainUsecase?.error &&
                  !addNewDomainUsecase?.associatedOrg,
              })}
              onKeyDownCapture={(e) => {
                e.stopPropagation();

                if (e.key === 'Enter') {
                  handleConfirm();
                }

                if (e.key === 'Escape') {
                  handleClose();
                }
              }}
            />
            {addNewDomainUsecase?.error &&
              !addNewDomainUsecase.associatedOrg && (
                <p className='text-xs text-error-600'>
                  {' '}
                  {addNewDomainUsecase.error}
                </p>
              )}
          </div>

          <div className='flex justify-between gap-3 mt-6'>
            <CommandCancelButton onClose={handleClose} />

            <Button
              size='sm'
              variant='outline'
              className='w-full'
              colorScheme='primary'
              onClick={handleConfirm}
              dataTest={'add-domain'}
              loadingText={'Adding domain...'}
              isLoading={addNewDomainUsecase?.isValidating}
              data-test='contact-actions-confirm-flow-change'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            >
              Add domain
            </Button>
          </div>
        </>
      </article>

      <DuplicateDomainInformation
        onClose={handleClose}
        isOpen={showDuplicateInfo}
        domain={addNewDomainUsecase?.inputValue}
        associatedOrg={addNewDomainUsecase?.associatedOrg}
      />
    </Command>
  );
});
