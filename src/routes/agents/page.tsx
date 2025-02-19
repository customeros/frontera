import { useMemo, useEffect } from 'react';

import { useKeys } from 'rooks';
import { observer } from 'mobx-react-lite';
import { useUnmount, useLocalStorage } from 'usehooks-ts';
import { EditAgentStatusUsecase } from '@domain/usecases/agents/edit-agent-status';

import { useStore } from '@shared/hooks/useStore';
import { useModKey } from '@shared/hooks/useModKey';
import { PreviewCard } from '@shared/components/PreviewCard';
import { ShortcutsPanel } from '@shared/components/PreviewCard/components/ShortcutsPanel';
import {
  ScrollAreaRoot,
  ScrollAreaThumb,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
} from '@ui/utils/ScrollArea';

import { useSlackOauthCallback } from './hooks';
import { Header, AgentCard, EmptyState } from './components';

export const AgentsPage = observer(() => {
  const store = useStore();
  const [firstView, setFirstView] = useLocalStorage(
    'cos_agents_first_view',
    false,
  );

  const agents = store.agents.toArray();

  const id = store.ui.commandMenu.context.ids?.[0];

  const usecase = useMemo(() => new EditAgentStatusUsecase(id), [id]);

  useSlackOauthCallback();

  if ((!agents.length && store.agents.isBootstrapped) || !firstView) {
    return (
      <EmptyState
        onClick={() => {
          if (!firstView) {
            setFirstView(true);

            return;
          }
          store.ui.commandMenu.setType('CreateAgent');
          store.ui.commandMenu.setOpen(true);
        }}
      />
    );
  }

  useKeys(['Shift', 'S'], (e) => {
    e.stopPropagation();
    e.preventDefault();
    usecase.toggleActive();
  });

  useKeys(['Shift', 'R'], (e) => {
    e.stopPropagation();
    e.preventDefault();
    store.ui.commandMenu.setType('RenameAgent');
    store.ui.commandMenu.setOpen(true);
  });

  useModKey('Backspace', () => {
    store.ui.commandMenu.setType('ArchiveAgent');
    store.ui.commandMenu.setOpen(true);
  });

  useEffect(() => {
    store.ui.commandMenu.setType('AgentsCommands');
  }, []);

  useEffect(() => {
    return () => {
      store.ui.commandMenu.clearContext();
      store.ui.commandMenu.setType('AgentsCommands');
    };
  }, []);

  useUnmount(() => {
    store.ui.setShortcutsPanel(false);
  });

  return (
    <div>
      <Header />
      <div className='flex h-full'>
        <div className='relative h-full w-full'>
          <div className='h-full'>
            <ScrollAreaRoot className='h-full'>
              <ScrollAreaViewport>
                <div className='flex flex-wrap p-4 gap-4'>
                  {agents
                    .filter((agent) => agent.value.visible)
                    .map((agent) => (
                      <AgentCard
                        id={agent.id}
                        key={agent.id}
                        icon={agent.value.icon}
                        name={agent.value.name}
                        colorMap={agent.colorMap}
                        metric={agent.value.metric}
                        defaultName={agent.defaultName}
                        status={agent.value.isActive ? 'ON' : 'OFF'}
                        hasError={
                          !!agent.value.error || !agent.value.isConfigured
                        }
                      />
                    ))}
                  <div className='min-w-[372px] flex-1'></div>
                  <div className='min-w-[372px] flex-1'></div>
                  <div className='min-w-[372px] flex-1'></div>
                </div>
              </ScrollAreaViewport>
              <ScrollAreaScrollbar orientation='vertical'>
                <ScrollAreaThumb />
              </ScrollAreaScrollbar>
            </ScrollAreaRoot>
          </div>
        </div>

        <div className='h-full'>
          {store.ui.showShortcutsPanel && (
            <PreviewCard>
              <ShortcutsPanel />
            </PreviewCard>
          )}
        </div>
      </div>
    </div>
  );
});
