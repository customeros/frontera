import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { webtrackConfigStore } from '@domain/stores/settings.store';
import { AddWebsiteTrackerUseCase } from '@domain/usecases/settings/website-tracker/add-website-tracker.usecase';

import { Icon } from '@ui/media/Icon/Icon';
import { Input } from '@ui/form/Input/Input';
import { Button } from '@ui/form/Button/Button';
import { Modal } from '@ui/overlay/Modal/Modal';
import { ModalFooter } from '@ui/overlay/Modal/Modal';
import { ModalPortal } from '@ui/overlay/Modal/Modal';
import { ModalContent, ModalOverlay } from '@ui/overlay/Modal/Modal';

import { EmptyState, DomainCard } from './components';

export const WebsiteTracker = observer(() => {
  const usecase = useMemo(
    () => new AddWebsiteTrackerUseCase(webtrackConfigStore),
    [],
  );

  if (
    webtrackConfigStore.toArray().filter((webtracker) => !webtracker.isArchived)
      .length === 0
  ) {
    return (
      <div className='flex flex-col h-full w-full max-w-[448px] border-r border-grayModern-200'>
        <EmptyState usecase={usecase} />
      </div>
    );
  }

  return (
    <>
      <div className='px-4 pb-4 flex flex-col max-w-[448px] h-full text-sm border-r overflow-y-auto max-h-[calc(100vh-1px)]'>
        <div className=' pt-1 flex justify-between items-center sticky top-0 bg-white z-10'>
          <h1 className='font-medium text-base'> Website tracker</h1>
          <Button
            size='xs'
            colorScheme='primary'
            leftIcon={<Icon name='plus' />}
            onClick={() => usecase.toggleModal()}
          >
            Website
          </Button>
        </div>
        <p className='mb-2'>
          Automatically identify leads from your websites and add them to your
          workspace
        </p>
        {webtrackConfigStore
          .toArray()
          .filter((webtracker) => !webtracker.isArchived)
          .map((webtracker) => (
            <div className='mb-2' key={webtracker.id}>
              <DomainCard webtrackerId={webtracker.id} />
            </div>
          ))}
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
