import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon, IconName } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Tag, TagLabel } from '@ui/presentation/Tag';

interface AgentCardProps {
  id: string;
}

export const AgentCard = observer(({ id }: AgentCardProps) => {
  const store = useStore();
  const navigate = useNavigate();

  const agent = store.agents.getById(id);

  if (!agent) return null;
  const hasError = !!agent.value.error || !agent.value.isConfigured;

  const tagColor =
    hasError && agent.value.isActive
      ? 'warning'
      : !agent.value.isActive
      ? 'grayModern'
      : 'success';

  const [ring, bg, iconColor] = agent.colorMap;

  const handleStateChange = (isActive: boolean) => {
    if (store.ui.commandMenu.isOpen) return;

    if (isActive) {
      store.ui.commandMenu.setContext({
        ...store.ui.commandMenu.context,
        ids: [id],
      });
      store.ui.commandMenu.setType('AgentCommands');
    } else {
      store.ui.commandMenu.clearContext();
      store.ui.commandMenu.setType('AgentsCommands');
    }
  };

  return (
    <div
      tabIndex={0}
      role={'button'}
      onFocus={() => handleStateChange(true)}
      onBlur={() => handleStateChange(false)}
      onClick={() => navigate(`/agents/${id}`)}
      onMouseEnter={() => handleStateChange(true)}
      onMouseLeave={() => handleStateChange(false)}
      className={cn(
        ' min-w-[372px] flex-1 rounded-lg flex items-center gap-2 ring-0 border cursor-pointer group hover:bg-white hover:shadow-lg flex-col transition-all ring-grayModern-200 hover:ring-1',
        ring,
      )}
    >
      <div className='flex flex-col w-full'>
        <div
          className={cn(
            'flex items-center justify-between gap-2 w-full px-3 pt-3 pb-2',
            {
              'pb-3': !agent.value.metric,
            },
          )}
        >
          <div
            className={cn(
              'p-2 flex items-center rounded-lg bg-grayModern-50',
              bg,
            )}
          >
            <Icon
              name={(agent.value.icon as IconName) ?? 'radar'}
              className={cn('size-6 text-grayModern-500', iconColor)}
            />
          </div>
          <div className='flex justify-between w-full'>
            <div className='flex flex-col justify-center'>
              {agent.value.name.toLowerCase() !==
                agent.defaultName.toLowerCase() && (
                <p className='line-clamp-1 text-xs text-grayModern-500'>
                  {agent.defaultName}
                </p>
              )}
              <p className='line-clamp-2 text-sm font-medium'>
                {agent.value.name || agent.defaultName}
              </p>
            </div>
            <div className='flex items-center'>
              <Tag colorScheme={tagColor}>
                <TagLabel className='flex items-center gap-1'>
                  <Icon
                    stroke={
                      hasError && agent.value.isActive ? 'currentColor' : 'none'
                    }
                    className={cn('size-3', {
                      'text-warning-500': hasError && agent.value.isActive,
                      'text-gray-500': !agent.value.isActive,
                    })}
                    name={
                      hasError && agent.value.isActive
                        ? 'alert-triangle'
                        : !agent.value.isActive
                        ? 'dot-single'
                        : 'dot-live-success'
                    }
                  />
                  {agent.value.isActive ? 'ON' : 'OFF'}
                </TagLabel>
              </Tag>
            </div>
          </div>
        </div>

        {agent.value.metric && (
          <div className='flex items-center gap-2 bg-grayModern-50 w-full py-2 rounded-b-lg px-6'>
            <div className='flex items-center gap-2'>
                <Icon
                    name='check-circle'
                    className='size-3 text-grayModern-500'
                />
              <p className='text-xs'>{agent.value.metric}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
