import { observer } from 'mobx-react-lite';

import { useStore } from '@shared/hooks/useStore';

export const Assignees = observer(({ assignees }: { assignees: string }) => {
  const store = useStore();

  if (!assignees) {
    return (
      <span
        className='text-grayModern-400 cursor-pointer'
        onClick={() => {
          store.ui.commandMenu.setType('AssignTask');
          store.ui.commandMenu.setOpen(true);
        }}
      >
        Not assigned yet
      </span>
    );
  }

  return (
    <span
      className='cursor-pointer'
      onClick={() => {
        store.ui.commandMenu.setType('AssignTask');
        store.ui.commandMenu.setOpen(true);
      }}
    >
      {assignees}
    </span>
  );
});
