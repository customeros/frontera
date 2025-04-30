import { observer } from 'mobx-react-lite';
import { MeetingSchedulerUsecase } from '@domain/usecases/settings/meeting-scheduler/meeting-scheduler.usecase';

import { Icon } from '@ui/media/Icon';
import { Radio, RadioGroup } from '@ui/form/Radio';
import { MeetingBookingAssignmentMethod } from '@shared/types/__generated__/graphql.types';

interface AssignmentMethodProps {
  usecase: MeetingSchedulerUsecase;
}

export const AssignmentMethod = observer(
  ({ usecase }: AssignmentMethodProps) => {
    return (
      <>
        <div className='flex items-center gap-2'>
          <Icon name='shuffle-01' className='text-grayModern-500' />
          <p className='font-medium'> Assignment method</p>
          <Icon
            name='info-circle'
            className='cursor-pointer'
            onClick={() => {
              usecase.toggleInfoDialog();
            }}
          />
        </div>
        <RadioGroup
          value={usecase.meetingConfig.assignmentMethod}
          onValueChange={(value) => {
            usecase.updateMeetingConfig({
              assignmentMethod: value as MeetingBookingAssignmentMethod,
            });
          }}
        >
          <Radio
            value={MeetingBookingAssignmentMethod.RoundRobinMaxAvailability}
          >
            <span>Round-robin • Maximize for availability</span>
          </Radio>
          <Radio value={MeetingBookingAssignmentMethod.Custom}>
            <span>Custom logic</span>
          </Radio>
        </RadioGroup>
      </>
    );
  },
);
