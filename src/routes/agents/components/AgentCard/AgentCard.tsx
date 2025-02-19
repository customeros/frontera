import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon, IconName } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { Tag, TagLabel } from '@ui/presentation/Tag';

interface AgentCardProps {
  id: string;
  name: string;
  icon?: string;
  metric?: string;
  hasError?: boolean;
  defaultName: string;
  status: 'ON' | 'OFF';
  colorMap: [ring: string, bg: string, iconColor: string];
}

export const AgentCard = observer(
  ({
    id,
    name,
    icon,
    metric,
    status,
    hasError,
    defaultName,
    colorMap,
  }: AgentCardProps) => {
    const store = useStore();

    const navigate = useNavigate();
    const tagColor =
      hasError && status === 'ON'
        ? 'warning'
        : status === 'OFF'
        ? 'grayModern'
        : 'success';

    const [ring, bg, iconColor] = colorMap;

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
        <div className='flex flex-col w-full gap-2'>
          <div className='flex items-center justify-between gap-2 w-full px-3 pt-3'>
            <div
              className={cn(
                'p-2 flex items-center rounded-lg bg-grayModern-50',
                bg,
              )}
            >
              <Icon
                name={(icon as IconName) ?? 'radar'}
                className={cn('size-6 text-grayModern-500', iconColor)}
              />
            </div>
            <div className='flex justify-between w-full'>
              <div className='flex flex-col justify-center'>
                {name.toLowerCase() !== defaultName.toLowerCase() && (
                  <p className='line-clamp-1 text-xs text-grayModern-500'>
                    {defaultName}
                  </p>
                )}
                <p className='line-clamp-2 text-sm font-medium'>
                  {name || defaultName}
                </p>
              </div>
              <div className='flex items-center'>
                <Tag colorScheme={tagColor}>
                  <TagLabel className='flex items-center gap-1'>
                    <Icon
                      stroke={
                        hasError && status === 'ON' ? 'currentColor' : 'none'
                      }
                      className={cn('size-3', {
                        'text-warning-500': hasError && status === 'ON',
                        'text-gray-500': status === 'OFF',
                      })}
                      name={
                        hasError && status === 'ON'
                          ? 'alert-triangle'
                          : status === 'OFF'
                          ? 'dot-single'
                          : 'dot-live-success'
                      }
                    />
                    {status}
                  </TagLabel>
                </Tag>
              </div>
            </div>
          </div>

          {metric && (
            <div className='flex items-center gap-2 bg-grayModern-50 w-full py-2 rounded-b-lg px-6'>
              <div className='flex items-center gap-2'>
                <Icon name='clock' className='size-3 text-grayModern-500' />
                <p className='text-xs'>{metric}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
