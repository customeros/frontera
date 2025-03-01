import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { Agent } from '@store/Agents/Agent.dto.ts';
import { InvoiceStore } from '@store/Invoices/Invoice.store.ts';

import { FeaturedIcon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { FileX02 } from '@ui/media/icons/FileX02';
import { Invoice } from '@shared/components/Invoice/Invoice';
import { InvoiceSkeleton } from '@shared/components/Invoice/InvoiceSkeleton';
import {
  AgentType,
  InvoiceLine,
  BankAccount,
  InvoiceCustomer,
  InvoiceProvider,
} from '@graphql/types';
interface InvoicePreviewModalProps {
  isFetching?: boolean;
  invoiceStore: InvoiceStore | undefined | null;
}

const extractAddressData = (
  invoiceData: InvoiceCustomer | (InvoiceProvider & { email: string }),
) => {
  return {
    zip: invoiceData?.addressZip ?? '',
    email: invoiceData?.email ?? '',
    name: invoiceData?.name ?? '',
    country: invoiceData?.addressCountry ?? '',
    locality: invoiceData?.addressLocality ?? '',
    addressLine1: invoiceData?.addressLine1 ?? '',
    addressLine2: invoiceData?.addressLine2 ?? '',
    region: invoiceData?.addressRegion ?? '',
  };
};

export const InvoicePreviewModalContent = observer(
  ({ invoiceStore, isFetching }: InvoicePreviewModalProps) => {
    const store = useStore();
    const cashflowAgent = store.agents.getFirstAgentByType(
      AgentType.CashflowGuardian,
    )?.value;

    const bankDetails = useMemo(() => {
      const capability = cashflowAgent?.capabilities.find(
        (e) => e.type === 'GENERATE_INVOICE',
      );

      if (!capability || !capability.active || !capability.config) return false;

      const bankPaymentConfig = Agent.parseConfig(capability.config);

      const result: Record<string, unknown> = {};

      for (const key in bankPaymentConfig) {
        if (Object.prototype.hasOwnProperty.call(bankPaymentConfig, key)) {
          result[key] = bankPaymentConfig[key].value;
        }
      }

      return result;
    }, [cashflowAgent?.capabilities]);

    if (isFetching) {
      return <InvoiceSkeleton />;
    }
    const invoice = invoiceStore?.value;

    if (!invoice) {
      return (
        <div className='flex flex-col items-center px-4 py-4 mt-5 overflow-hidden'>
          <FeaturedIcon colorScheme='warning'>
            <FileX02 className='size-7' />
          </FeaturedIcon>
          <h2 className='text-md mt-4 mb-1'>Preview not available</h2>
          <span className='text-center text-sm text-grayModern-500'>
            Sorry, selected invoice cannot be previewed at this moment
          </span>
        </div>
      );
    }

    const customerAddressData = extractAddressData(invoice?.customer);
    const providerAddressData = extractAddressData({
      ...(invoice?.provider ?? {}),
      email: invoiceStore?.provider?.sendInvoicesFrom,
    });

    return (
      <Invoice
        note={invoice?.note}
        tax={invoice?.taxDue}
        dueDate={invoice.due}
        status={invoice?.status}
        total={invoice.amountDue}
        from={providerAddressData}
        subtotal={invoice.subtotal}
        issueDate={invoice?.issued}
        billedTo={customerAddressData}
        check={invoiceStore.provider?.check}
        currency={invoice?.currency || 'USD'}
        invoicePeriodEnd={invoice?.invoicePeriodEnd}
        invoiceNumber={invoice?.invoiceNumber ?? ''}
        invoicePeriodStart={invoice?.invoicePeriodStart}
        availableBankAccount={bankDetails as Partial<BankAccount>}
        lines={(invoice?.invoiceLineItems as Array<InvoiceLine>) ?? []}
        billingPeriodsInMonths={
          invoice?.contract?.billingDetails?.billingCycleInMonths
        }
        canPayWithBankTransfer={
          invoiceStore?.contract?.billingDetails?.canPayWithBankTransfer
        }
      />
    );
  },
);
