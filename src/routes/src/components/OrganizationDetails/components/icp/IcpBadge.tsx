import { observer } from 'mobx-react-lite';
import { Popover } from '@radix-ui/react-popover';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Spinner } from '@ui/feedback/Spinner';
import { Button } from '@ui/form/Button/Button';
import { Tag, TagLabel, TagProps } from '@ui/presentation/Tag';
import { QualifiedBy, QualificationStatus } from '@graphql/types';
import { PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';

interface IcpBadgeProps {
  qualifiedBy: QualifiedBy;
  qualificationStatus: QualificationStatus;
}

const complications: Record<
  QualificationStatus,
  [
    label: string,
    colorScheme: TagProps['colorScheme'],
    leftElement?: React.ReactElement,
    rightElement?: React.ReactElement,
    popoverContent?: React.ReactElement,
  ]
> = {
  [QualificationStatus.Pending]: ['Not qualified yet', 'grayModern'],
  [QualificationStatus.Qualified]: [
    'ICP fit',
    'success',
    <Icon name='check-verified-02' />,
    <Icon name='chevron-right' />,
  ],
  [QualificationStatus.NotQualified]: [
    'Not a fit',
    'warning',
    <Icon name='x-close' />,
    <Icon name='chevron-right' />,
  ],
  [QualificationStatus.Qualifying]: [
    'Qualifying',
    'grayModern',
    <Spinner
      size='xs'
      label='qualifying'
      className='text-grayModern-300 fill-grayModern-500'
    />,
    undefined,
    <div className='flex flex-col max-w-64 gap-4'>
      <span className='text-sm'>
        One moment... we are determining whether this lead fits your ICP
      </span>
      <Button size='xs' colorScheme='primary'>
        See my ICP
      </Button>
    </div>,
  ],
};

export const IcpBadge = observer(({ qualificationStatus }: IcpBadgeProps) => {
  if (!qualificationStatus) return null;
  const [label, colorScheme, leftElement, rightElement, popoverContent] =
    complications[qualificationStatus];

  return (
    <Popover>
      <PopoverTrigger className={cn(!popoverContent && 'cursor-default')}>
        <Tag colorScheme={colorScheme}>
          <TagLabel className='flex items-center gap-1'>
            {leftElement} {label} {rightElement}
          </TagLabel>
        </Tag>
      </PopoverTrigger>
      {popoverContent && <PopoverContent>{popoverContent}</PopoverContent>}
    </Popover>
  );
});
