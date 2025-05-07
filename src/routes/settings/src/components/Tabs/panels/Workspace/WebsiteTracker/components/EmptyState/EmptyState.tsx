import { observer } from 'mobx-react-lite';
import { AddWebsiteTrackerUseCase } from '@domain/usecases/settings/website-tracker/add-website-tracker.usecase';

import { Input } from '@ui/form/Input';
import { Icon } from '@ui/media/Icon/Icon';
import { FeaturedIcon } from '@ui/media/Icon';
import { Button } from '@ui/form/Button/Button';
import { ModalOverlay } from '@ui/overlay/Modal';
import SvgHalfCirclePattern from '@shared/assets/HalfCirclePattern';
import {
  Modal,
  ModalPortal,
  ModalFooter,
  ModalContent,
} from '@ui/overlay/Modal/Modal';

interface EmptyStateProps {
  usecase: AddWebsiteTrackerUseCase;
}

export const EmptyState = observer(({ usecase }: EmptyStateProps) => {
  return (
    <>
      <div className='flex flex-col h-full w-full max-w-[448px]'>
        <div className='flex relative'>
          <FeaturedIcon
            size='lg'
            colorScheme='grayModern'
            className='absolute top-[26%] justify-self-center right-0 left-0'
          >
            <Icon name='radar' />
          </FeaturedIcon>
          <SvgHalfCirclePattern />
        </div>
        <div className='flex flex-col text-center items-center translate-y-[-212px]'>
          <p className='text-grayModern-700 text-md font-semibold mb-1'>
            Website tracker
          </p>
          <div className='text-sm my-1 max-w-[360px] text-center'>
            <p>
              Automatically identify leads from your websites and add them to
              your workspace
            </p>
          </div>
          <Button
            className='mt-6'
            colorScheme='primary'
            onClick={usecase.toggleModal}
          >
            Get started
          </Button>
        </div>
      </div>
      <Modal open={usecase.isModalOpen}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent>
            <div className='pt-4 px-6'>
              <div className='flex flex-col gap-4'>
                <h1 className='font-medium'>Add website to track</h1>
                <Input
                  placeholder='Website'
                  value={usecase.website}
                  onChange={(e) => usecase.setWebsite(e.target.value)}
                />
              </div>
            </div>
            <ModalFooter className='flex justify-between w-full gap-2'>
              <Button
                className='w-full'
                colorScheme='grayBlue'
                onClick={() => usecase.reset()}
              >
                Cancel
              </Button>
              <Button
                className='w-full'
                colorScheme='primary'
                onClick={() => {
                  usecase.execute();
                  usecase.reset();
                }}
              >
                Add website
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </>
  );
});
