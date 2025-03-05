import { Icon } from '@ui/media/Icon';
import { Button } from '@ui/form/Button/Button';
import { FeaturedIcon } from '@ui/media/Icon/FeaturedIcon';
import HalfCirclePattern from '@shared/assets/HalfCirclePattern';

interface EmptyContractsProps {
  isPending: boolean;
  companyName: string;
  onCreate: () => void;
}

export const EmptyContracts = ({
  onCreate,
  isPending,
  companyName,
}: EmptyContractsProps) => {
  return (
    <div className='flex justify-center'>
      <div className='flex flex-col h-full w-full max-w-[448px]'>
        <div className='flex relative'>
          <FeaturedIcon
            size='lg'
            colorScheme='grayModern'
            className='absolute top-[26%] justify-self-center right-0 left-0'
          >
            <Icon name='file-02' />
          </FeaturedIcon>
          <HalfCirclePattern />
        </div>
        <div className='flex flex-col text-center items-center translate-y-[-212px]'>
          <h1 className='text-md font-semibold mb-1'>No signatures yet</h1>
          <p className='text-sm mt-1 text-center max-w-[360px]'>
            Add a contract to track your business relationship with{' '}
            {companyName}
          </p>
          <Button
            size='sm'
            variant='outline'
            onClick={onCreate}
            colorScheme='primary'
            isDisabled={isPending}
            className='text-sm mt-6 w-fit'
            dataTest='org-account-empty-new-contract'
          >
            {isPending ? 'Adding contract...' : 'Add contract'}
          </Button>
        </div>
      </div>
    </div>
  );
};
