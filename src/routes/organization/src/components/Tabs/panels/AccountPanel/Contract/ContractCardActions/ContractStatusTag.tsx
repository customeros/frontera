import { ReactNode } from 'react';

import { DateTimeUtils } from '@utils/date';
import { Icon, IconName } from '@ui/media/Icon';
import { ContractStatus } from '@graphql/types';
import { SelectOption } from '@shared/types/SelectOptions';
import { Tag, TagLabel, TagLeftIcon } from '@ui/presentation/Tag/Tag';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

interface ContractStatusSelectProps {
  status: ContractStatus;
  statusContent: ReactNode;
  contractStarted?: string;
  onHandleStatusChange: () => void;
}

const statusColorScheme: Record<string, string> = {
  [ContractStatus.Live]: 'primary',
  [ContractStatus.Draft]: 'grayModern',
  [ContractStatus.Ended]: 'grayModern',
  [ContractStatus.Scheduled]: 'primary',
  [ContractStatus.OutOfContract]: 'warning',
};
const contractOptionIcon: Record<ContractStatus, IconName | null> = {
  [ContractStatus.Draft]: 'edit-03',
  [ContractStatus.Ended]: 'x-square',
  [ContractStatus.Live]: 'dot-live-primary',
  [ContractStatus.OutOfContract]: 'pause-circle',
  [ContractStatus.Scheduled]: 'clock',
  [ContractStatus.Undefined]: null,
};

export const ContractStatusTag = ({
  status,
  contractStarted,
  statusContent,
  onHandleStatusChange,
}: ContractStatusSelectProps) => {
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

  const selected = contractStatusOptions.find((e) => e.value === status);
  const icon = contractOptionIcon?.[status];

  return (
    <>
      <Menu>
        <MenuButton
          disabled={
            status === ContractStatus.Scheduled ||
            status === ContractStatus.Ended
          }
        >
          <Tag colorScheme={statusColorScheme[status] as 'primary'}>
            {icon && (
              <TagLeftIcon>
                <Icon name={icon} />
              </TagLeftIcon>
            )}

            <TagLabel className='whitespace-nowrap'>{selected?.label}</TagLabel>
          </Tag>
        </MenuButton>

        <MenuList align='end' side='bottom'>
          <MenuItem onClick={onHandleStatusChange}>{statusContent}</MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};
