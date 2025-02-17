import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';

import { FlowStatus } from '@graphql/types';
import { Check } from '@ui/media/icons/Check';
import { useStore } from '@shared/hooks/useStore';
import { CommandSubItem } from '@ui/overlay/CommandMenu';
import { Columns03 } from '@ui/media/icons/Columns03.tsx';

import { flowKeywords } from './keywords';

export const UpdateStatusSubItemGroup = observer(() => {
  const store = useStore();
  const context = store.ui.commandMenu.context;
  const selectedIds = context.ids;

  const isSelected = () => {
    if (selectedIds.length > 1) {
      return;
    } else {
      const flow = store.flows.value.get(selectedIds[0]);

      return flow?.value.status;
    }
  };

  const handleUpdateStatus = (status: FlowStatus) => {
    if (!context.ids?.[0]) return;

    match(context.entity)
      .with('Flow', () => {
        if (status === FlowStatus.On) {
          store.ui.commandMenu.setOpen(true, {
            type: 'StartFlow',
            context: {
              ids: selectedIds,
              entity: 'Flow',
            },
          });

          return;
        }

        if (status === FlowStatus.Off) {
          store.ui.commandMenu.setOpen(true, {
            type: 'StopFlow',
            context: {
              ids: selectedIds,
              entity: 'Flow',
            },
          });

          return;
        }
      })
      .with('Flows', () => {
        context.ids?.forEach((id) => {
          const flow = store.flows.value.get(id);

          flow?.update((value) => {
            value.status = status;

            return value;
          });
          store.ui.commandMenu.setOpen(false);
          store.ui.commandMenu.setType('FlowCommands');
        });
      });
  };

  return (
    <>
      <CommandSubItem
        rightLabel='Live'
        icon={<Columns03 />}
        leftLabel='Change flow status'
        keywords={[...flowKeywords.status_update, 'live']}
        rightAccessory={isSelected() === FlowStatus.On ? <Check /> : null}
        onSelectAction={() => {
          handleUpdateStatus(FlowStatus.On);
        }}
      />

      <CommandSubItem
        icon={<Columns03 />}
        rightLabel='Stopped'
        leftLabel='Change flow status'
        keywords={[...flowKeywords.status_update, 'stopped', 'paused']}
        rightAccessory={isSelected() === FlowStatus.Off ? <Check /> : null}
        onSelectAction={() => {
          handleUpdateStatus(FlowStatus.Off);
        }}
      />
    </>
  );
});
