import { useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import { useKey } from 'rooks';
import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Image } from '@ui/media/Image/Image';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { TopNav } from '@organization/components/TopNav';
import { UserPresence } from '@shared/components/UserPresence';
import { StagePicker } from '@organization/components/StagePicker';
import { LoadingScreen } from '@shared/components/SplashScreen/components';
import { TimelineContextsProvider } from '@organization/components/TimelineContextsProvider';

import { MainSection } from './src/components/MainSection';
import { LeftSection } from './src/components/LeftSection';
import { Panels, TabsContainer } from './src/components/Tabs';
import { RelationshipPicker } from './src/components/RelationshipPicker';
import { OrganizationTimelineWithActionsContext } from './src/components/Timeline/OrganizationTimelineWithActionsContext';

export const OrganizationPage = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  const [lastActivePosition] = useLocalStorage(
    `customeros-player-last-position`,
    { root: 'finder' },
  );

  const [lastKnownIndex, setLastKnownIndex] = useState<number>(0);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  );

  const getLastPreset = useCallback(() => {
    const preset = lastActivePosition.root.split('=')?.[1];

    if (preset) {
      return preset;
    }

    return store.tableViewDefs.organizationsPreset;
  }, [lastActivePosition.root]);

  const panel = searchParams.get('tab') ?? 'about';

  if (typeof id === 'undefined') {
    navigate('/finder');

    return;
  }

  if (!store.organizations.isBootstrapped) {
    // This should not be used here
    // TODO: Remove this.
    return (
      <LoadingScreen
        hide={false}
        isLoaded={false}
        showSplash={true}
        isRetrying={false}
      />
    );
  }

  if (!store.organizations.value.has(id)) {
    throw new Error('Company not found');
  }

  const organization = store.organizations.getById(id!);
  const src = organization?.value.iconUrl || organization?.value.logoUrl;

  const preset = (() => {
    const lastPreset = getLastPreset();
    const { targetsPreset, organizationsPreset, customersPreset } =
      store.tableViewDefs;

    if (
      [targetsPreset, organizationsPreset, customersPreset].includes(lastPreset)
    ) {
      return lastPreset;
    }

    return organizationsPreset;
  })();

  const data = store.organizations.getViewById(preset ?? '');

  const currentIndex = useMemo(() => {
    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
      return Math.min(lastKnownIndex, data.length - 1);
    }

    // If the difference between current index and last known index is greater than 1,
    // use the last known index to prevent jumping around
    if (Math.abs(index - lastKnownIndex) > 1) {
      return lastKnownIndex;
    }

    setLastKnownIndex(index);

    return index;
  }, [data, id, store.organizations.version, lastKnownIndex]);

  const total = store.organizations.availableCounts.get(preset ?? '');

  const navigateToOrg = async (direction: 'prev' | 'next') => {
    const newIndex =
      direction === 'prev'
        ? (currentIndex - 1 + data.length) % data.length
        : (currentIndex + 1) % data.length;

    if (
      direction === 'next' &&
      newIndex === 0 &&
      data.length < (total ?? data.length)
    ) {
      await store.organizations.loadNext(
        preset ?? store.tableViewDefs.organizationsPreset!,
      );
    }

    navigate(`/organization/${data[newIndex].id}?tab=${panel}`);
  };

  useKey('d', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToOrg('next');
  });

  useKey('a', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToOrg('prev');
  });

  return (
    <div className='relative flex flex-col h-[calc(100vh-42px)]'>
      <div className='w-full bg-white border-b border-grayModern-200 px-4 min-h-[42px] flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          {src ? (
            <Image
              src={src}
              width={22}
              loading='lazy'
              decoding='async'
              alt={organization?.name}
              onError={() => setImgStatus('error')}
              onLoad={() => setImgStatus('loaded')}
              className={cn(
                'size-[22px] rounded-[4px] border border-grayModern-200 object-contain',
                {
                  'opacity-0 size-0': imgStatus === 'loading',
                  'opacity-100': imgStatus === 'loaded',
                },
              )}
            />
          ) : (
            <Icon name='building-06' className='size-5 text-grayModern-700' />
          )}
          <h1 className='font-medium text-md'>{organization?.name}</h1>
        </div>

        <RelationshipPicker />
        <StagePicker />

        <div className='flex-1 min-h-[28px]' />
        <div className='flex items-center gap-1 ml-2 text-sm'>
          <span>{currentIndex + 1}</span>
          <span>/</span>
          <span className='text-grayModern-500'>{total?.toLocaleString()}</span>
        </div>
        <div className='flex items-center gap-1'>
          <IconButton
            size='xxs'
            title='Previous company (A)'
            aria-label='Previous company'
            isDisabled={currentIndex === 0}
            onClick={() => navigateToOrg('prev')}
            className='p-1 hover:bg-grayModern-100 rounded'
            icon={<Icon name='chevron-up' className='text-grayModern-700' />}
          />
          <IconButton
            size='xxs'
            title='Next company (D)'
            aria-label='Next company'
            icon={<Icon name='chevron-down' />}
            onClick={() => navigateToOrg('next')}
            className='p-1 hover:bg-grayModern-100 rounded'
            isDisabled={currentIndex === (total ?? data.length) - 1}
          />
        </div>
        {organization?.id && (
          <UserPresence
            channelName={`organization_presence:${organization?.id}`}
          />
        )}
      </div>
      <div className='relative flex h-full'>
        <TimelineContextsProvider id={id}>
          <LeftSection>
            <TabsContainer>
              <TopNav />
              <Panels tab={panel} />
            </TabsContainer>
          </LeftSection>

          <MainSection>
            <OrganizationTimelineWithActionsContext />
          </MainSection>
        </TimelineContextsProvider>
      </div>
    </div>
  );
});
