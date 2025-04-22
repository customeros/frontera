import { useRef, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { Tasks } from '@store/Tasks/Tasks.store';
import { Organization } from '@/domain/entities';
import { registry } from '@domain/stores/registry';
import { FlowStore } from '@store/Flows/Flow.store';
import { Contact } from '@store/Contacts/Contact.dto';
import { OrganizationService } from '@domain/services';
import { TableViewDef } from '@store/TableViewDefs/TableViewDef.dto';
import { OpportunityStore } from '@store/Opportunities/Opportunity.store';

import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import {
  Command,
  CommandCancelButton,
  CommandCancelIconButton,
} from '@ui/overlay/CommandMenu';

export const DeleteConfirmationModal = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const navigate = useNavigate();
  const location = useLocation();
  const organizationStore = registry.get('organizations');
  const organizationService = useMemo(() => new OrganizationService(), []);

  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const entity = match(context.entity)
    .returnType<
      | OpportunityStore
      | Organization
      | TableViewDef
      | Contact
      | FlowStore
      | Tasks
      | undefined
      | null
    >()
    .with('Opportunity', () => store.opportunities.value.get(context.ids?.[0]))
    .with('Organization', () => organizationStore.get(context.ids?.[0]))
    .with('Contact', () => store.contacts.value.get(context.ids?.[0]))
    .with('TableViewDef', () => store.tableViewDefs.getById(context.ids?.[0]))
    .with(
      'Flow',
      () => store.flows.value.get(context.ids?.[0]) as FlowStore | undefined,
    )
    .with(
      'Task',
      () => store.tasks.value.get(context.ids?.[0]) as Tasks | undefined,
    )
    .otherwise(() => undefined);

  const handleClose = () => {
    store.ui.commandMenu.setOpen(false);

    match(context.entity)
      .with('Organization', () => {
        store.ui.commandMenu.setType('OrganizationCommands');
      })
      .with('Organizations', () => {
        store.ui.commandMenu.setType('OrganizationBulkCommands');
      })
      .with('Contact', () => {
        store.ui.commandMenu.setType('ContactHub');
      })
      .with('Opportunity', () => {
        store.ui.commandMenu.setType('OpportunityCommands');
      })
      .with('Opportunities', () => {
        store.ui.commandMenu.setType('OpportunityCommands');
      })
      .with('Flow', () => {
        store.ui.commandMenu.setType('FlowCommands');
      })
      .with('Flows', () => {
        store.ui.commandMenu.setType('FlowsBulkCommands');
      })
      .with('Task', () => {
        store.ui.commandMenu.setType('TaskCommands');
      })
      .with('Tasks', () => {
        store.ui.commandMenu.setType('TaskBulkCommands');
      });
  };

  const handleConfirm = () => {
    match(context.entity)
      .with('Organization', () => {
        const oppoortunityOfOrgSelected = store.opportunities
          .toArray()
          .filter((o) => o.value.organization?.metadata.id === context.ids[0]);

        const oppotunityIdOfOrgSelected = oppoortunityOfOrgSelected.map(
          (o) => o.value.id,
        );

        organizationService.archiveBulk(context.ids as string[]);

        store.opportunities.value.delete(oppotunityIdOfOrgSelected[0]);
        store.ui.commandMenu.setType('OrganizationHub');
        store.ui.commandMenu.clearContextIds();
        store.ui.commandMenu.clearContext();
        context.callback?.();
      })
      .with('Organizations', () => {
        organizationService.archiveBulk(context.ids as string[]);
        store.ui.commandMenu.setType('OrganizationHub');
        store.ui.commandMenu.clearContextIds();
        store.ui.commandMenu.clearContext();

        context.callback?.();
      })
      .with('Contact', () => {
        store.contacts.archive(context.ids);
        store.ui.commandMenu.setType('ContactHub');
        store.ui.commandMenu.clearContextIds();
        store.ui.commandMenu.clearContext();

        context.callback?.();
      })
      .with('Opportunity', () => {
        store.opportunities.archive(context.ids?.[0]);
        store.ui.commandMenu.setType('OpportunityHub');
        store.ui.commandMenu.clearCallback();
        store.ui.commandMenu.clearContext();

        context.callback?.();
      })
      .with('Opportunities', () => {
        store.opportunities.archiveMany(context.ids);
        store.ui.commandMenu.setType('OpportunityHub');
        store.ui.commandMenu.clearCallback();
        store.ui.commandMenu.clearContext();

        context.callback?.();
      })
      .with('Flow', () => {
        store.flows.archive(context.ids?.[0], {
          onSuccess: () => {
            if (location.pathname.includes('flow-editor')) {
              navigate(`/finder?preset=${store.tableViewDefs.flowsPreset}`);
            }
          },
        });
        context.callback?.();

        store.ui.commandMenu.setType('FlowHub');
        store.ui.commandMenu.clearCallback();
        store.ui.commandMenu.clearContext();
      })
      .with('Flows', () => {
        store.flows.archiveMany(context.ids);
        context.callback?.();
        store.ui.commandMenu.setType('FlowHub');

        store.ui.commandMenu.clearCallback();
        store.ui.commandMenu.clearContext();
      })
      .with('TableViewDef', () => {
        store.tableViewDefs.archive(context.ids?.[0], {
          onSuccess: () => {
            navigate(
              `/finder?preset=${store.tableViewDefs.organizationsPreset}`,
            );
          },
        });
      })
      .with('Task', () => {
        store.tasks.archive([context.ids?.[0]]);
        store.ui.commandMenu.setType('TaskCommands');
        store.ui.commandMenu.clearCallback();
        store.ui.commandMenu.clearContext();
      })
      .with('Tasks', () => {
        store.tasks.archive(context.ids);
        store.ui.commandMenu.setType('TaskBulkCommands');
        store.ui.commandMenu.clearCallback();
        store.ui.commandMenu.clearContext();
      })
      .otherwise(() => {});

    store.ui.commandMenu.setOpen(false);
  };

  const title = match(context.entity)
    .with(
      'Organization',
      () => `Archive ${(entity as Organization)?.name || 'Unnamed'}?`,
    )
    .with('Organizations', () => `Archive ${context.ids?.length} companies?`)
    .with(
      'Opportunities',
      () => `Archive ${context.ids?.length} opportunities?`,
    )
    .with(
      'Opportunity',
      () => `Archive ${(entity as OpportunityStore)?.value.name}?`,
    )
    .with('Flows', () => `Archive ${context.ids.length} flows?`)
    .with(
      'Flow',
      () => `Archive ${store.flows.value.get(context.ids?.[0])?.value.name}?`,
    )

    .with('Contact', () =>
      context.ids?.length > 1
        ? `Archive ${context.ids?.length} contacts?`
        : `Archive ${(entity as Contact)?.name}?`,
    )
    .with(
      'TableViewDef',
      () => `Archive '${(entity as TableViewDef)?.value.name}' ?`,
    )
    .with('Task', () => `Archive this task?`)
    .with('Tasks', () => `Archive these tasks?`)
    .otherwise(() => `Archive selected ${context.entity?.toLowerCase()}`);

  const description = match(context.entity)
    .with(
      'Flow',
      () => `Archiving this flow will end all active contacts currently in it`, // todo update contacts to dynamic value when we'll be able to get different record types
    )
    .with(
      'Flows',
      () =>
        `Archiving these flows will end all active contacts currently in it`, // todo update contacts to dynamic value when we'll be able to get different record types
    )
    .with(
      'Task',
      () =>
        `Would you like to archive ${
          store.tasks.getById(context.ids?.[0])?.value.subject
        }?`,
    )
    .with('Tasks', () => `Would you like to archive these tasks?`)
    .otherwise(() => null);

  const confirmButtonLabel = match(context.entity)
    .with('Flows', () => `Archive flows`)
    .with('Flow', () => `Archive flow`)
    .with('Task', () => `Archive task`)
    .with('Tasks', () => `Archive tasks`)
    .otherwise(() => 'Archive');

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <Command>
      <article className='relative w-full p-6 flex flex-col border-b border-b-grayModern-100'>
        <div className='flex items-center justify-between'>
          <h1 className='text-base font-semibold'>{title}</h1>
          <CommandCancelIconButton onClose={handleClose} />
        </div>
        {description && <p className='mt-1 text-sm'>{description}</p>}

        <div className='flex justify-between gap-3 mt-6'>
          <CommandCancelButton ref={closeButtonRef} onClose={handleClose} />

          <Button
            size='sm'
            variant='outline'
            className='w-full'
            colorScheme='error'
            ref={confirmButtonRef}
            onClick={handleConfirm}
            dataTest='org-actions-confirm-archive'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          >
            {confirmButtonLabel}
          </Button>
        </div>
      </article>
    </Command>
  );
});
