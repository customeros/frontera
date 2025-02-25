import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { ContractStatus } from '@graphql/types';
import { Divider } from '@ui/presentation/Divider/Divider';

import { ProductsList } from './components/ProductsList';
import { AddNewProductMenu } from './components/AddNewProductMenu';

interface SubscriptionProductModalProps {
  id: string;
  currency?: string;
  contractStatus?: ContractStatus | null;
}

export const Products = observer(
  ({ id, currency, contractStatus }: SubscriptionProductModalProps) => {
    return (
      <>
        <Divider className='my-3' />

        <div className='flex relative justify-between items-center  text-sm font-medium'>
          <p className='text-sm font-medium  flex items-center after:border-t-2 w-fit whitespace-nowrap mr-2 gap-x-2'>
            <Icon name='grid-01' className='w-4 h-4 text-grayModern-500' />
            Products
          </p>
          <AddNewProductMenu contractId={id} />
        </div>

        <ProductsList
          id={id}
          currency={currency}
          contractStatus={contractStatus}
        />
      </>
    );
  },
);
