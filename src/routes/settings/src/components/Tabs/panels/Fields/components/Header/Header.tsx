import { useSearchParams } from 'react-router-dom';

import { cn } from '@ui/utils/cn';
import { Input } from '@ui/form/Input';
import { Plus } from '@ui/media/icons/Plus';
import { Button } from '@ui/form/Button/Button';
import { ButtonGroup } from '@ui/form/ButtonGroup';
import { SearchSm } from '@ui/media/icons/SearchSm';
import { InputGroup, LeftElement } from '@ui/form/InputGroup';
import { useDisclosure } from '@ui/utils/hooks/useDisclosure';

import { CustomFieldModal } from '../CustomFieldModal';

interface HeaderProps {
  title: string;
  subTitle: string;
  numberOfCoreFields: number;
  numberOfCustomFields: number;
}

export const Header = ({
  title,
  subTitle,
  numberOfCoreFields = 0,
  numberOfCustomFields = 0,
}: HeaderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { onOpen, onToggle, open } = useDisclosure();

  const handleItemClick = (tab: string) => () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    params.set('view', tab);
    setSearchParams(params.toString());
  };
  const checkIsActive = (tab: string) => searchParams?.get('view') === tab;

  const checkIsActiveCustom = checkIsActive('custom');
  const checkIsActiveCore = checkIsActive('core');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    params.set('search', e.target.value);
    setSearchParams(params.toString());
  };

  return (
    <>
      <div className='flex items-center justify-between  pt-[5px] sticky top-0 bg-grayModern-25 z-10'>
        <h1 className='font-medium'>{title}</h1>
        <Button
          size='xs'
          leftIcon={<Plus />}
          colorScheme='primary'
          onClick={() => onOpen()}
        >
          Custom field
        </Button>
      </div>
      <h2 className='text-sm'>{subTitle}</h2>
      <div className='flex flex-col gap-4 mt-4'>
        <ButtonGroup className='items-center'>
          <Button
            size='sm'
            onClick={handleItemClick('custom')}
            className={cn('w-full', {
              selected: checkIsActiveCustom,
            })}
          >
            Custom • {numberOfCustomFields}
          </Button>
          <Button
            size='sm'
            onClick={handleItemClick('core')}
            className={cn('w-full', {
              selected: checkIsActiveCore,
            })}
          >
            Core • {numberOfCoreFields}
          </Button>
        </ButtonGroup>
        <InputGroup className=''>
          <LeftElement>
            <SearchSm className='text-grayModern-500' />
          </LeftElement>
          <Input
            size='sm'
            variant='unstyled'
            placeholder='Search fields...'
            onChange={(e) => handleSearch(e)}
            value={searchParams?.get('search') || ''}
          />
        </InputGroup>
      </div>
      {open && <CustomFieldModal isOpen={open} onOpenChange={onToggle} />}
    </>
  );
};
