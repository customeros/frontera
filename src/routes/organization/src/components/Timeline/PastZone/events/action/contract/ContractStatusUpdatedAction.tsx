import { useMemo } from 'react';

import { cn } from '@ui/utils/cn';
import { Action } from '@graphql/types';
import { getMetadata } from '@organization/components/Timeline/PastZone/events/action/utils';
import { iconsByStatus } from '@organization/components/Timeline/PastZone/events/action/contract/utils';
import { useTimelineEventPreviewMethodsContext } from '@organization/components/Timeline/shared/TimelineEventPreview/context/TimelineEventPreviewContext';

interface ContractStatusUpdatedActionProps {
  data: Action;
}

export const ContractStatusUpdatedAction = ({
  data,
}: ContractStatusUpdatedActionProps) => {
  const { openModal } = useTimelineEventPreviewMethodsContext();
  const status = useMemo(() => {
    return getMetadata(data?.metadata)?.status?.toLowerCase();
  }, [data?.metadata]);

  // handle this situation
  if (!data.content || !status) return null;
  const content = data.content.replace(status.split('_').join(' '), '');

  return (
    <div
      onClick={() => openModal(data.id)}
      className='flex items-center cursor-pointer'
    >
      {iconsByStatus[status]?.icon}

      <p className='max-w-[500px] ml-2 text-sm text-grayModern-700 line-clamp-2'>
        {content}
        <span
          className={cn(
            status === 'renewed' ? 'font-base' : 'font-semibold',
            'ml-1',
          )}
        >
          {status.split('_').join(' ')}
        </span>
      </p>
    </div>
  );
};
