import { useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMergeRefs } from 'rooks';
import { observer } from 'mobx-react-lite';
import { OpportunityStore } from '@store/Opportunities/Opportunity.store';
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';

import { cn } from '@ui/utils/cn';
import { DateTimeUtils } from '@utils/date';
import { Clock } from '@ui/media/icons/Clock';
import { useStore } from '@shared/hooks/useStore';
import { Divider } from '@ui/presentation/Divider';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { useOutsideClick } from '@ui/utils/hooks/useOutsideClick';
import { InternalStage } from '@shared/types/__generated__/graphql.types';

import { Task } from './Task';
import { Owner } from './Owner';
import { MoreMenu } from './MoreMenu';
import { ArrEstimate } from './ArrEstimate';
import { OpportunityName } from './OpportunityName';

interface DraggableKanbanCardProps {
  index: number;
  onBlur: () => void;
  isFocused?: boolean;
  card: OpportunityStore;
  noPointerEvents?: boolean;
  onFocus: (id: string) => void;
}

export const DraggableKanbanCard = forwardRef<
  HTMLDivElement,
  DraggableKanbanCardProps
>(({ card, index, noPointerEvents, onBlur, onFocus, isFocused }, _ref) => {
  return (
    <Draggable index={index} draggableId={card?.value?.metadata.id}>
      {(provided, snapshot) => {
        return (
          <KanbanCard
            card={card}
            onBlur={onBlur}
            onFocus={onFocus}
            provided={provided}
            snapshot={snapshot}
            isFocused={isFocused}
            noPointerEvents={noPointerEvents}
          />
        );
      }}
    </Draggable>
  );
});

interface KanbanCardProps {
  onBlur: () => void;
  isFocused?: boolean;
  card: OpportunityStore;
  noPointerEvents?: boolean;
  provided?: DraggableProvided;
  onFocus: (id: string) => void;
  snapshot?: DraggableStateSnapshot;
}

export const KanbanCard = observer(
  ({
    card,
    onBlur,
    onFocus,
    provided,
    snapshot,
    isFocused,
    noPointerEvents,
  }: KanbanCardProps) => {
    const store = useStore();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergeRefs(provided?.innerRef, containerRef);

    const organization = card.organization;
    const logo = organization?.iconUrl || organization?.logoUrl;
    const daysInStage = card.value?.stageLastUpdated
      ? DateTimeUtils.differenceInDays(
          new Date().toISOString(),
          card.value?.stageLastUpdated,
        )
      : 0;

    const cardStage = card.value.internalStage;

    if (!card.value.metadata.id) return null;

    const handleAddTaskClick = () => {
      if (card.value.taskIds[0]) {
        store.tasks.getById(card.value.taskIds[0])?.removeOpportunity(card.id);
        card.value.taskIds = [];

        if (store.ui.showPreviewCard) {
          store.ui.setShowPreviewCard(false);
        }
      } else {
        store.ui.commandMenu.setType('SetOpportunityTask');
        store.ui.commandMenu.setOpen(true);
      }
    };

    useOutsideClick({
      handler: () => {
        if (store.ui.commandMenu.isOpen) return;
        onBlur();
      },
      enabled: isFocused,
      ref: containerRef,
    });

    return (
      <div
        ref={mergedRef}
        {...provided?.draggableProps}
        {...provided?.dragHandleProps}
        data-test='opp-kanban-card'
        onMouseEnter={() => {
          onFocus(card.id);
        }}
        onClick={() => {
          if (!card.value.taskIds[0]) return;

          if (
            store.ui.showPreviewCard &&
            store.ui.focusRow === card.value.taskIds[0]
          ) {
            store.ui.setShowPreviewCard(false);
          } else {
            store.ui.setFocusRow(card.value.taskIds[0]);
            store.ui.setShowPreviewCard(true);
          }
        }}
        className={cn(
          'group/kanbanCard  relative flex flex-col items-start px-3 pb-3 pt-[6px] mb-2 bg-white rounded-lg border border-grayModern-200 shadow-xs hover:shadow-lg focus:border-primary-500 transition-all duration-200 ease-in-out',
          {
            '!shadow-lg cursor-grabbing': snapshot?.isDragging,
            'pointer-events-none': noPointerEvents,
            'border-grayModern-400': isFocused,
          },
        )}
      >
        <div className='flex flex-col w-full items-start gap-2'>
          <div className='flex gap-2 w-full justify-between items-start'>
            <div className='flex gap-2 items-center'>
              <div className='flex flex-col'>
                <OpportunityName opportunityId={card.id} />
                <p
                  className='text-sm text-grayModern-500 p-0 hovergrayModernt-grayModern-700 hover:cursor-pointer'
                  onClick={(e) => {
                    logo &&
                      navigate(
                        `/organization/${card.value?.organization?.metadata.id}/`,
                      );
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  {organization?.name
                    ? organization.name
                    : 'Company loading...'}
                </p>
              </div>
            </div>

            <MoreMenu
              hasTask={!!card.value.taskIds[0]}
              onAddTaskClick={handleAddTaskClick}
            />
          </div>

          <div
            className='flex items-center gap-2 w-full'
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Owner opportunityId={card.id} ownerId={card.owner?.id} />

            <div className='flex items-center justify-between w-full mb-[-4px]'>
              <Tooltip label='ARR estimate'>
                <div>
                  <ArrEstimate opportunityId={card.id} />
                </div>
              </Tooltip>

              <Tooltip label='Time in stage'>
                {cardStage === InternalStage.Open && (
                  <div className='flex items-center'>
                    <Clock
                      dataTest='kanban-clock'
                      className='text-grayModern-500 size-3 mr-1'
                    />
                    <span className='text-nowrap text-xs items-center'>
                      {`${daysInStage} ${daysInStage === 1 ? 'day' : 'days'}`}
                    </span>
                  </div>
                )}
              </Tooltip>
            </div>
          </div>
        </div>
        {card.value.taskIds.length > 0 && (
          <>
            <Divider className='mt-3 mb-2' />
            <Task taskId={card.value.taskIds[0]} />
          </>
        )}
      </div>
    );
  },
);
