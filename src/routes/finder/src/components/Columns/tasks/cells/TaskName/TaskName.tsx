import { observer } from 'mobx-react-lite';
import { type Task } from '@store/Tasks/Task.dto';

import { Icon } from '@ui/media/Icon';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

export const TaskNameCell = observer(({ task }: { task: Task }) => {
  const store = useStore();

  return (
    <div className='flex items-center gap-2 group/taskName w-full'>
      <span
        className='overflow-ellipsis overflow-hidden font-medium no-underline hover:no-underline cursor-pointer'
        onClick={() => {
          if (store.ui.showPreviewCard && store.ui.focusRow === task.id) {
            store.ui.setShowPreviewCard(false);
          } else {
            store.ui.setFocusRow(task.id);
            store.ui.setShowPreviewCard(true);
          }
        }}
      >
        {task.value.subject?.length === 0 ? (
          <span className='text-grayModern-400'>Unnamed task</span>
        ) : (
          task.value.subject
        )}
      </span>
      <IconButton
        size='xs'
        variant='ghost'
        aria-label='preview company'
        icon={<Icon name='eye' className='text-grayModern-500' />}
        className='hidden group-hover/taskName:flex cursor-pointer'
        onClick={() => {
          if (store.ui.showPreviewCard && store.ui.focusRow === task.id) {
            store.ui.setShowPreviewCard(false);
          } else {
            store.ui.setFocusRow(task.id);
            store.ui.setShowPreviewCard(true);
          }
        }}
      />
    </div>
  );
});
