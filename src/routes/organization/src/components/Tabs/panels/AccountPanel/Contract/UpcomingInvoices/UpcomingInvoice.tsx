import { format } from 'date-fns-tz';
import { UTCDate } from '@date-fns/utc';
import { addDays } from 'date-fns/addDays';
import { observer } from 'mobx-react-lite';

import { Contract } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';
import { formatCurrency } from '@utils/getFormattedCurrencyNumber';
import { useTimelineEventPreviewMethodsContext } from '@organization/components/Timeline/shared/TimelineEventPreview/context/TimelineEventPreviewContext';

function getCommittedPeriodLabel(months: string | number) {
  if (`${months}` === '1') {
    return 'Monthly';
  }

  if (`${months}` === '3') {
    return 'Quarterly';
  }

  if (`${months}` === '12') {
    return 'Annual';
  }

  return `${months}-month`;
}

interface UpcomingInvoiceProps {
  id: string;
  contractId: string;
}

export const UpcomingInvoice = observer(
  ({ id, contractId }: UpcomingInvoiceProps) => {
    const store = useStore();
    const { handleOpenInvoice } = useTimelineEventPreviewMethodsContext();
    const invoice = store.invoices.value.get(id)?.value;

    if (!invoice?.metadata.id) return null;
    const contract = store.contracts.value.get(contractId)?.value as Contract;
    const renewalPeriod = getCommittedPeriodLabel(
      contract?.committedPeriodInMonths,
    );
    const autoRenewal = contract?.autoRenew;

    const invoicePeriodStart = new UTCDate(invoice?.invoicePeriodStart);
    const invoicePeriodEnd = new UTCDate(invoice?.invoicePeriodEnd);

    const nextInvoiceDate = invoice?.postpaid
      ? new UTCDate(addDays(invoicePeriodEnd, 1))
      : invoicePeriodStart;

    return (
      <div
        tabIndex={0}
        role='button'
        key={invoice.metadata.id}
        className='flex text-sm flex-wrap'
        onClick={() => handleOpenInvoice(invoice.metadata.id)}
      >
        <div className='whitespace-nowrap mr-1'>
          {renewalPeriod} {autoRenewal ? 'recurring' : ''}:
        </div>
        <div className='whitespace-nowrap text-grayModern-500 underline'>
          {formatCurrency(invoice.amountDue, 2, invoice?.currency)} on{' '}
          {format(nextInvoiceDate, 'd MMM ’yy')} (
          {format(invoicePeriodStart, 'd MMM')} -{' '}
          {format(invoicePeriodEnd, 'd MMM ’yy')})
        </div>
      </div>
    );
  },
);
