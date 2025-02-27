import { DateTimeUtils } from '@utils/date.ts';
import { Icon, IconName } from '@ui/media/Icon';
import { ContractStatus } from '@graphql/types';
import { SelectOption } from '@shared/types/SelectOptions.ts';
import { Tag, TagLabel, TagLeftIcon } from '@ui/presentation/Tag';

export const ContractStatusTag = ({
  status,
  contractStarted,
}: {
  status: ContractStatus;
  contractStarted?: string;
}) => {
  const statusColorScheme: Record<string, string> = {
    [ContractStatus.Live]: 'primary',
    [ContractStatus.Draft]: 'grayModern',
    [ContractStatus.Ended]: 'grayModern',
    [ContractStatus.Scheduled]: 'primary',
    [ContractStatus.OutOfContract]: 'warning',
  };
  const contractStatusOptions: SelectOption<ContractStatus>[] = [
    { label: 'Draft', value: ContractStatus.Draft },
    { label: 'Ended', value: ContractStatus.Ended },
    { label: 'Live', value: ContractStatus.Live },
    { label: 'Out of contract', value: ContractStatus.OutOfContract },
    {
      label: contractStarted
        ? `Live ${DateTimeUtils.format(
            contractStarted,
            DateTimeUtils.defaultFormatShortString,
          )}`
        : 'Scheduled',
      value: ContractStatus.Scheduled,
    },
  ];
  const icon = contractOptionIcon?.[status];
  const selected = contractStatusOptions.find((e) => e.value === status);

  return (
    <Tag colorScheme={statusColorScheme[status] as 'primary'}>
      {icon && (
        <TagLeftIcon>
          <Icon name={icon} />
        </TagLeftIcon>
      )}

      <TagLabel className='whitespace-nowrap'>{selected?.label}</TagLabel>
    </Tag>
  );
};
const contractOptionIcon: Record<ContractStatus, IconName | null> = {
  [ContractStatus.Draft]: 'edit-03',
  [ContractStatus.Ended]: 'x-square',
  [ContractStatus.Live]: 'dot-live-primary',
  [ContractStatus.OutOfContract]: 'pause-circle',
  [ContractStatus.Scheduled]: 'clock',
  [ContractStatus.Undefined]: null,
};
