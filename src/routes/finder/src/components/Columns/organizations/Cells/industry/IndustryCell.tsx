import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { OrganizationService } from '@/domain/services';

import { FlagWrongFields } from '@graphql/types';
import { ThumbsDown } from '@ui/media/icons/ThumbsDown.tsx';

export const IndustryCell = observer(
  ({
    value,
    id,
    enrichingStatus,
    flaggedAsIncorrect,
  }: {
    id: string;
    value?: string;
    enrichingStatus: boolean;
    flaggedAsIncorrect: boolean;
  }) => {
    const organization = registry.get('organizations').get(id);
    const organizationService = useMemo(() => new OrganizationService(), []);

    if (!organization || !value)
      return (
        <p className='text-grayModern-400'>
          {enrichingStatus ? 'Enriching...' : 'Not found yet'}
        </p>
      );

    return (
      <div className='flex items-center gap-2 group/industry'>
        <p
          title={value}
          className='text-grayModern-700 cursor-default truncate group'
        >
          {value}
        </p>

        <div
          tabIndex={0}
          role={'button'}
          title={
            flaggedAsIncorrect
              ? 'Reported as incorrect before'
              : `This industry is incorrect`
          }
          onClick={() =>
            organizationService.flagWrongField(
              organization,
              FlagWrongFields.OrganizationIndustry,
            )
          }
        >
          <ThumbsDown className='text-grayModern-500 hovergrayModernt-grayModern-700 opacity-0 group-hover/industry:opacity-100 block size-3' />
        </div>
      </div>
    );
  },
);
