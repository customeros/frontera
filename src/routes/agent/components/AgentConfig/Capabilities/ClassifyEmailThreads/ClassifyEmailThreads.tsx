import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { ClassifyEmailThreadsUsecase } from '@domain/usecases/agents/capabilities/classify-email-threads.usecase';

import { Icon } from '@ui/media/Icon';
import { CapabilityType } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';
import { Radio, RadioGroup } from '@ui/form/Radio';
type ClassifyEmailThreadsValue = 'AUTOMATICALLY' | 'MANUALLY';

export const ClassifyEmailThreads = observer(() => {
  const store = useStore();
  const { id } = useParams<{ id: string }>();

  const usecase = useMemo(() => new ClassifyEmailThreadsUsecase(id!), [id]);

  const agent = store.agents.getById(id ?? '');

  if (!agent) return null;

  return (
    <div>
      <div className='flex items-center justify-between mb-1'>
        <h2 className='text-sm font-medium '>
          {agent.getCapabilityName(CapabilityType.ClassifyEmail)}
        </h2>
      </div>
      <p className='text-sm mb-4'>
        Only commercial emails for Target or Customer companies will be
        imported, excluding all with ‘confidential’ in the subject line
      </p>
      {usecase.capabilityErrors && (
        <div className='bg-error-50 text-error-700 px-2 py-1 rounded-[4px] mb-4'>
          <Icon stroke='none' className='mr-2' name='dot-single' />
          <span className='text-sm'>{usecase.capabilityErrors}</span>
        </div>
      )}

      <div className='flex flex-col w-full'>
        <RadioGroup
          className={'gap-1'}
          value={usecase.value}
          id={'classify-email-threads'}
          name='classify-email-threads'
          onValueChange={(val: ClassifyEmailThreadsValue) =>
            usecase.setValue(val)
          }
        >
          <Radio value={'AUTOMATICALLY'}>
            <div className='flex flex-col'>
              <span
                className='text-sm font-medium'
                data-test={'classify-email-threads-automatically'}
              >
                Automatically import emails
              </span>
            </div>
          </Radio>
          <span className='text-sm ml-6 mb-3'>
            Automatically import emails that meet the required conditions
          </span>
          <Radio value={'MANUALLY'}>
            <div className='flex flex-col'>
              <span
                className='text-sm font-medium'
                data-test={'classify-email-threads-manually'}
              >
                Only import emails when I choose
              </span>
            </div>
          </Radio>
          <span className='text-sm ml-6'>
            Manually choose which companies to import emails for{' '}
          </span>
        </RadioGroup>
      </div>
    </div>
  );
});
