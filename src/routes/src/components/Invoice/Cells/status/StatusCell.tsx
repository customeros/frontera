import { Icon } from '@ui/media/Icon';
import { InvoiceStatus } from '@graphql/types';
import { ClockFastForward } from '@ui/media/icons/ClockFastForward';
import { Tag, TagLabel, TagLeftIcon } from '@ui/presentation/Tag/Tag';

interface StatusCellProps {
  className?: string;
  status?: InvoiceStatus | null;
}

export function renderStatusNode(type: InvoiceStatus | null | undefined) {
  switch (type) {
    case InvoiceStatus.Initialized:
      return (
        <Tag variant='outline' colorScheme='grayModern'>
          <TagLeftIcon>
            <Icon name='clock-fast-forward' />
            <ClockFastForward />
          </TagLeftIcon>
          <TagLabel>Draft</TagLabel>
        </Tag>
      );
    case InvoiceStatus.Paid:
      return (
        <Tag variant='outline' colorScheme='success'>
          <TagLeftIcon>
            <Icon name='check-circle' />
          </TagLeftIcon>
          <TagLabel>Paid</TagLabel>
        </Tag>
      );
    case InvoiceStatus.Due:
      return (
        <Tag variant='outline' colorScheme='primary'>
          <TagLeftIcon>
            <Icon name='clock' />
          </TagLeftIcon>
          <TagLabel>Due</TagLabel>
        </Tag>
      );
    case InvoiceStatus.Void:
      return (
        <Tag variant='outline' colorScheme='grayModern'>
          <TagLeftIcon>
            <Icon name='slash-circle-01' />
          </TagLeftIcon>
          <TagLabel>Voided</TagLabel>
        </Tag>
      );
    case InvoiceStatus.Scheduled:
      return (
        <Tag variant='outline' colorScheme='grayModern'>
          <TagLeftIcon>
            <Icon name='clock-fast-forward' />
          </TagLeftIcon>
          <TagLabel>Scheduled</TagLabel>
        </Tag>
      );
    case InvoiceStatus.Overdue:
      return (
        <Tag variant='outline' colorScheme='warning'>
          <TagLeftIcon>
            <Icon name='info-circle' />
          </TagLeftIcon>
          <TagLabel>Overdue</TagLabel>
        </Tag>
      );
    case InvoiceStatus.PaymentProcessing:
      return (
        <Tag variant='outline' colorScheme='grayModern'>
          <TagLeftIcon>
            <Icon name='clock-fast-forward' />
          </TagLeftIcon>
          <TagLabel>Processing</TagLabel>
        </Tag>
      );
    case InvoiceStatus.OnHold:
      return (
        <Tag variant='outline' colorScheme='grayModern'>
          <TagLeftIcon>
            <Icon name='pause-circle' />
          </TagLeftIcon>
          <TagLabel>On Hold</TagLabel>
        </Tag>
      );

    default:
      return null;
  }
}

export const StatusCell = ({ status }: StatusCellProps) => {
  return <div className='flex items-center'>{renderStatusNode(status)}</div>;
};
