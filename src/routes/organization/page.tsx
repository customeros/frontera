import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Image } from '@ui/media/Image/Image';
import { useStore } from '@shared/hooks/useStore';
import { TopNav } from '@organization/components/TopNav';
import { UserPresence } from '@shared/components/UserPresence';
import { LoadingScreen } from '@shared/components/SplashScreen/components';
import { TimelineContextsProvider } from '@organization/components/TimelineContextsProvider';

import { SideSection } from './src/components/SideSection';
import { MainSection } from './src/components/MainSection';
import { Panels, TabsContainer } from './src/components/Tabs';
import { RelationshipPicker } from './src/components/RelationshipPicker';
import { OrganizationTimelineWithActionsContext } from './src/components/Timeline/OrganizationTimelineWithActionsContext';

export const OrganizationPage = observer(() => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  );

  const store = useStore();

  const { id } = params;

  if (typeof id === 'undefined') {
    navigate('/finder');

    return;
  }

  if (!store.organizations.isBootstrapped) {
    return <LoadingScreen hide={false} isLoaded={false} showSplash={true} />;
  }

  if (!store.organizations.value.has(id)) {
    throw new Error('Company not found');
  }

  const organization = store.organizations.getById(id!);
  const src = organization?.value.iconUrl || organization?.value.logoUrl;

  return (
    <div className='flex flex-col h-full'>
      <div className='w-full bg-white border-b border-grayModern-200 px-4 min-h-[42px] flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          {src && imgStatus !== 'error' ? (
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
        <div className='flex-1 min-h-[28px]' />
        {organization?.id && (
          <UserPresence
            channelName={`organization_presence:${organization?.id}`}
          />
        )}
      </div>
      <div className='flex h-full'>
        <TimelineContextsProvider id={id}>
          <SideSection>
            <TabsContainer>
              <TopNav />
              <Panels tab={searchParams.get('tab') ?? 'about'} />
            </TabsContainer>
          </SideSection>

          <MainSection>
            <OrganizationTimelineWithActionsContext />
          </MainSection>
        </TimelineContextsProvider>
      </div>
    </div>
  );
});
