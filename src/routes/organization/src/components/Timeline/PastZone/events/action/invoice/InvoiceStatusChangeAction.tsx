import { useMemo } from 'react';

import { cn } from '@ui/utils/cn';
import { File02 } from '@ui/media/icons/File02';
import { Action, ActionType } from '@graphql/types';
import { FileX02 } from '@ui/media/icons/FileX02.tsx';
import { FileCheck02 } from '@ui/media/icons/FileCheck02';
import { SlashCircle01 } from '@ui/media/icons/SlashCircle01';
import { formatCurrency } from '@utils/getFormattedCurrencyNumber';
import { FileAttachment02 } from '@ui/media/icons/FileAttachment02';
import { getMetadata } from '@organization/components/Timeline/PastZone/events/action/utils';
import { useTimelineEventPreviewMethodsContext } from '@organization/components/Timeline/shared/TimelineEventPreview/context/TimelineEventPreviewContext';

interface InvoiceStatusChangeActionProps {
  data: Action;
  mode:
    | ActionType.InvoiceIssued
    | ActionType.InvoiceSent
    | ActionType.InvoicePaid
    | ActionType.InvoiceOverdue
    | ActionType.InvoiceVoided;
}

interface InvoiceStubMetadata {
  id: string;
  status: string;
  number: string;
  amount: number;
  currency: string;
}

const iconMap: Record<string, JSX.Element> = {
  [ActionType.InvoiceVoided]: <SlashCircle01 className='text-grayModern-500' />,
  [ActionType.InvoicePaid]: <FileCheck02 className='text-success-600' />,
  [ActionType.InvoiceSent]: <FileAttachment02 className='text-primary-600' />,
  [ActionType.InvoiceIssued]: <File02 className='text-primary-600' />,
  [ActionType.InvoiceOverdue]: <FileX02 className='text-primary-600' />,
};

const InvoiceStatusChangeAction = ({
  data,
  mode,
}: InvoiceStatusChangeActionProps) => {
  const isTemporary = data.appSource === 'customeros-optimistic-update';
  const { handleOpenInvoice } = useTimelineEventPreviewMethodsContext();

  const metadata = useMemo(() => {
    return getMetadata(data?.metadata) as unknown as InvoiceStubMetadata;
  }, [data?.metadata]);

  if (!data.content) return <div>No data available</div>;

  const formattedContent = formatInvoiceText(data.content, metadata);

  return (
    <div
      tabIndex={0}
      role='button'
      onClick={() =>
        !isTemporary && metadata?.id && handleOpenInvoice(metadata.number)
      }
      className={cn('flex items-center pointer focus:outline-none min-h-10 ', {
        'not-allowed': isTemporary || !metadata?.number,
        'opacity-50': isTemporary,
      })}
    >
      {iconMap[mode]}
      <p className='my-1 max-w-[500px] ml-2 text-sm text-grayModern-700 '>
        {formattedContent}
      </p>
    </div>
  );
};

const formatInvoiceText = (
  text: string,
  metadata: InvoiceStubMetadata,
): React.ReactNode => {
  if (!metadata) return text;

  const { number, amount, currency } = metadata;
  const formattedAmount = formatCurrency(amount, 2, currency);

  const invoiceNumberRegex = /N°\s+\w+-\d+/;
  const amountRegex = /\$?\d+(?:\.\d+)?/;

  const invoiceNumberMatch = text.match(invoiceNumberRegex);
  const amountMatch = text.match(amountRegex);

  if (!invoiceNumberMatch || !amountMatch) return text;

  const parts = text.split(invoiceNumberRegex);

  if (parts.length !== 2) return text;

  const [beforeInvoice, afterInvoice] = parts;
  const amountParts = afterInvoice.split(amountRegex);

  return (
    <>
      {beforeInvoice?.trim()}
      <span className='font-medium mx-1'>N° {number}</span>
      {amountParts?.[0]?.trim()}
      <span className='font-medium mx-1'>{formattedAmount}</span>
      {amountParts?.[1]?.trim()}
    </>
  );
};

export default InvoiceStatusChangeAction;
