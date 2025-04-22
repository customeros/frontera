import { useMemo, ReactNode } from 'react';

import { registry } from '@/domain/stores/registry';
import { OrganizationService } from '@/domain/services';

import { FlagWrongFields } from '@graphql/types';
import { IconButton } from '@ui/form/IconButton';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { ThumbsDown } from '@ui/media/icons/ThumbsDown';

interface FieldMarkerProps {
  id: string;
  icon: ReactNode;
  dataTest?: string;
  placeholder?: string;
  value?: string | null;
  field: FlagWrongFields;
  flaggedAsIncorrect: boolean;
}

export const AboutTabField = ({
  field,
  icon,
  value,
  dataTest,
  placeholder,
  flaggedAsIncorrect,
  id,
}: FieldMarkerProps) => {
  const label = fieldLabels[field];
  const organization = registry.get('organizations').get(id);
  const organizationService = useMemo(() => new OrganizationService(), []);

  if (!organization) return null;

  return (
    <div className='flex group'>
      <Tooltip align='start' label={label}>
        <div className='text-sm flex items-center cursor-default '>
          <div className='flex items-center'>{icon}</div>
          {value ? (
            <span>{value}</span>
          ) : (
            <span data-test={dataTest} className={'text-grayModern-400'}>
              {placeholder}
            </span>
          )}
        </div>
      </Tooltip>
      {value && (
        <Tooltip
          label={
            flaggedAsIncorrect
              ? 'Reported as incorrect before'
              : `This ${label.toLowerCase()} is incorrect`
          }
        >
          <div>
            <IconButton
              size='xxs'
              variant='ghost'
              icon={<ThumbsDown />}
              aria-label={`Mark this ${label} as incorrect`}
              className='opacity-0 group-hover:opacity-100 ml-2'
              onClick={() =>
                organizationService.flagWrongField(organization, field)
              }
            />
          </div>
        </Tooltip>
      )}
    </div>
  );
};

const fieldLabels: Record<FlagWrongFields, string> = {
  [FlagWrongFields.OrganizationIndustry]: 'Industry',
};
