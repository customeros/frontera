import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { InvoicePastDueUsecase } from '@domain/usecases/agents/listeners/invoice-past-due.usecase';

import { Switch } from '@ui/form/Switch/Switch';
import { Tag, TagLabel } from '@ui/presentation/Tag';

export const InvoicePastDue = observer(() => {
  const { id } = useParams<{ id: string }>();
  const usecase = useMemo(() => new InvoicePastDueUsecase(id!), [id]);

  return (
    <div className='px-4 py-3'>
      <div className='flex items-center justify-between gap-2'>
        <h1 className='text-sm font-medium'>{usecase.listenerName}</h1>

        <Switch
          size='sm'
          checked={usecase.isEnabled}
          onChange={usecase.toggleCapability}
        />
      </div>

      <div className='mt-4'>
        <p className='text-sm font-medium'>Send a reminder email</p>

        <p className='text-sm'>
          Choose how long after an invoice is past due before sending a reminder
          email
        </p>

        <div className='flex gap-1 mt-2 cursor-pointer'>
          <Tag
            variant='subtle'
            onClick={() => usecase.setOverdueDays(7)}
            colorScheme={usecase.overdueDays === 7 ? 'primary' : 'grayModern'}
          >
            <TagLabel>7d</TagLabel>
          </Tag>
          <Tag
            variant='subtle'
            onClick={() => usecase.setOverdueDays(14)}
            colorScheme={usecase.overdueDays === 14 ? 'primary' : 'grayModern'}
          >
            <TagLabel>14d</TagLabel>
          </Tag>
          <Tag
            variant='subtle'
            onClick={() => usecase.setOverdueDays(30)}
            colorScheme={usecase.overdueDays === 30 ? 'primary' : 'grayModern'}
          >
            <TagLabel>30d</TagLabel>
          </Tag>
        </div>
      </div>
    </div>
  );
});
