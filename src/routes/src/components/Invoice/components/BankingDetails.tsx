import { useNavigate } from 'react-router-dom';

import { useStore } from '@shared/hooks/useStore';
import {
  Currency,
  AgentType,
  BankAccount,
  CapabilityType,
} from '@graphql/types';

type InvoiceHeaderProps = {
  currency?: string;
  invoiceNumber?: string | null;
  availableBankAccount?: Partial<BankAccount> | null;
};

const getBankDetails = (
  currency?: string,
  availableBankAccount?: Partial<BankAccount> | null,
): { label: string; value: string } => {
  const details = {
    label: 'BIC/Swift',
    value: availableBankAccount?.bic || '-',
  };

  switch (currency) {
    case Currency.Gbp:
      details.label = 'Sort code';
      details.value = availableBankAccount?.sortCode || '-';
      break;
    case Currency.Usd:
      details.label = 'Routing Number';
      details.value = availableBankAccount?.routingNumber || '-';
      break;
    case Currency.Eur:
      details.label = 'BIC/Swift';
      details.value = availableBankAccount?.bic || '-';
      break;
    default:
      break;
  }

  return details;
};

export const BankingDetails = ({
  availableBankAccount,
  currency,
  invoiceNumber,
}: InvoiceHeaderProps) => {
  const store = useStore();
  const navigate = useNavigate();
  const bankDetails: { label: string; value: string } = getBankDetails(
    currency,
    availableBankAccount,
  );

  const accountNumberLabel =
    currency === Currency.Eur ? 'IBAN' : 'Account number';
  const accountNumberValue =
    currency === Currency.Eur
      ? availableBankAccount?.iban
      : availableBankAccount?.accountNumber;
  const cashflowGuardianAgent = store.agents.getFirstAgentByType(
    AgentType.CashflowGuardian,
  );
  const getGenerateInvoiceCapability = store.agents
    .getById(cashflowGuardianAgent?.id ?? '')
    ?.value.capabilities.find(
      (capability) => capability.type === CapabilityType.GenerateInvoice,
    );

  return (
    <div
      className='flex flex-col border-t border-grayModern-300 py-2 cursor-pointer'
      onClick={() => {
        if (getGenerateInvoiceCapability) {
          navigate(
            `/agents/${cashflowGuardianAgent?.id}/${getGenerateInvoiceCapability?.id}`,
          );
        }
      }}
    >
      <span className='text-xs font-semibold'>Bank transfer</span>
      <div className='flex justify-between'>
        <div className='flex flex-col'>
          <span className='text-xs font-medium'>Bank name</span>
          <span className='text-xs text-grayModern-500'>
            {availableBankAccount?.bankName || '-'}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs font-medium'>{bankDetails.label}</span>
          <span className='text-xs text-grayModern-500'>
            {bankDetails.value}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs font-medium'>{accountNumberLabel}</span>
          <span className='text-xs text-grayModern-500'>
            {accountNumberValue || '-'}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs font-medium'>Reference</span>
          <span className='text-xs text-grayModern-500'>
            {invoiceNumber || '-'}
          </span>
        </div>
      </div>
    </div>
  );
};
