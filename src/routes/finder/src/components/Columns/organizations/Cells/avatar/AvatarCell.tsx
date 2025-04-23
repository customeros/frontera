import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';
import { registry } from '@domain/stores/registry';

import { cn } from '@ui/utils/cn';
import { Image } from '@ui/media/Image/Image';
import { Building06 } from '@ui/media/icons/Building06';

interface AvatarCellProps {
  id: string;
}

export const AvatarCell = observer(({ id }: AvatarCellProps) => {
  const navigate = useNavigate();
  const organization = registry.get('organizations').get(id);

  const [tabs] = useLocalStorage<{
    [key: string]: string;
  }>(`customeros-player-last-position`, { root: 'finder' });

  const src = organization?.iconUrl || organization?.logoUrl;
  const fullName = organization?.name || 'Unnamed';
  const [status, setStatus] = useState('loading');

  const handleNavigate = () => {
    const lastPositionParams = tabs[id];
    const href = getHref(id, lastPositionParams);

    navigate(href);
  };

  return (
    <div className='items-center ml-[1px]'>
      <div
        onClick={handleNavigate}
        className={cn(
          'w-6 h-6 flex items-center justify-center rounded border border-grayModern-200 cursor-pointer focus:outline-none',
          {
            'animate-pulse': organization?.isEnriching,
          },
        )}
      >
        {src && status !== 'error' && (
          <Image
            src={src}
            alt={fullName}
            loading='lazy'
            decoding='async'
            onError={() => setStatus('error')}
            onLoad={() => setStatus('loaded')}
            className={cn('w-full h-full object-contain', {
              'opacity-0 size-0': status === 'loading',
              'opacity-100': status === 'loaded',
            })}
          />
        )}

        {(!src || status === 'error' || status === 'loading') && (
          <Building06 className='w-4 h-4 text-grayModern-700' />
        )}
      </div>
    </div>
  );
});

function getHref(id: string, lastPositionParams: string | undefined) {
  return `/organization/${id}?${lastPositionParams || 'tab=about'}`;
}
