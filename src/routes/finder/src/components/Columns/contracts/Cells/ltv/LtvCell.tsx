import { formatCurrency } from '@utils/getFormattedCurrencyNumber.ts';

interface LtvCellProps {
  ltv: number;
  currency: string;
}

export const LtvCell = ({ currency, ltv }: LtvCellProps) => {
  if (!ltv) {
    return (
      <p className='text-grayModern-400'>
        {formatCurrency(0, 0, currency || 'USD')}
      </p>
    );
  }

  return (
    <div className='flex items-center'>
      {formatCurrency(ltv, 0, currency || 'USD')}
    </div>
  );
};
