import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { webtrackConfigStore } from '@domain/stores/settings.store';
import { DomainCardActionsUsecase } from '@domain/usecases/settings/website-tracker/domain-card-actions.usecase';

import { Icon } from '@ui/media/Icon/Icon';
import { IconButton } from '@ui/form/IconButton';
import { InfoDialog } from '@ui/overlay/AlertDialog/InfoDialog';
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard';
import { ConfirmDeleteDialog } from '@ui/overlay/AlertDialog/ConfirmDeleteDialog';
interface DomainCardProps {
  webtrackerId: string;
}

export const DomainCard = observer(({ webtrackerId }: DomainCardProps) => {
  const [_, copyToClipboard] = useCopyToClipboard();
  const webtracker = webtrackConfigStore.get(webtrackerId);

  const usecase = useMemo(
    () => new DomainCardActionsUsecase(webtracker!),
    [webtrackerId],
  );

  if (!webtracker) {
    return null;
  }

  const code =
    `<script id="customeros-metrics" type="text/javascript">` +
    `(function (c, u, s, t, o, m, e, r, O, S) {` +
    `var customerOS = document.createElement(s);` +
    `customerOS.src = u;` +
    `customerOS.async = true;` +
    `(document.body || document.head).appendChild(customerOS);` +
    `})(window, "https://${webtracker.cnameHost}.${webtracker.domain}/analytics-0.1.js", "script");` +
    `</script>`;

  return (
    <>
      <div className='px-3 pt-2 pb-3 rounded-lg border text-sm group'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <h2 className='font-medium'>{webtracker.domain}</h2>
            <IconButton
              size='xxs'
              variant='ghost'
              aria-label='expand'
              onClick={() => usecase.toggleCollapse()}
              className='group-hover:opacity-100 opacity-0'
              icon={
                <Icon
                  name={
                    usecase.isCollapsed ? 'chevron-collapse' : 'chevron-expand'
                  }
                />
              }
            />
          </div>
          <IconButton
            size='xxs'
            variant='ghost'
            aria-label='Delete'
            colorScheme='error'
            icon={<Icon name='trash-01' />}
            onClick={() => usecase.toggleConfirmDelete()}
            className='group-hover:opacity-100 opacity-0'
          />
        </div>
        {usecase.isCollapsed && (
          <>
            <p className='text-sm text-gray-600'>
              This website is not generating leads yet. Continue to...
            </p>

            <div className='grid grid-cols-[auto_1fr] gap-4 mt-4'>
              <div className='flex flex-col items-center pr-2 relative gap-2'>
                {!webtracker.isCnameConfigured ? (
                  <>
                    <div className='font-medium rounded-full bg-grayModern-200 size-5 flex items-center justify-center'>
                      1
                    </div>
                  </>
                ) : (
                  <>
                    <div className='flex items-center bg-success-100 rounded-full'>
                      <Icon name='check-circle' className='text-success-500 ' />
                    </div>
                  </>
                )}
                <div className='h-[110px] w-[1px] bg-grayModern-300' />
                {!webtracker.isProxyActive ? (
                  <div className='font-medium rounded-full bg-grayModern-200 size-5 flex items-center justify-center'>
                    2
                  </div>
                ) : (
                  <div className='flex items-center bg-success-100 rounded-full'>
                    <Icon name='check-circle' className='text-success-500 ' />
                  </div>
                )}
              </div>

              <div className='flex flex-col space-y-6'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <p className='font-medium'>
                      Set this record on your DNS provider:
                    </p>
                    <IconButton
                      size='xxs'
                      variant='ghost'
                      aria-label='info'
                      icon={<Icon name='info-circle' />}
                      onClick={() => usecase.toggleInfo()}
                    />
                  </div>

                  <div className='border border-gray-200 rounded-md px-3 py-2 bg-gray-50 space-y-1 text-sm'>
                    <p>
                      <strong>Type:</strong> CNAME
                    </p>
                    <p>
                      <strong>Name/Host:</strong> {webtracker.cnameHost}
                    </p>
                    <p>
                      <strong>Content:</strong> {webtracker.cnameTarget}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <p className='font-medium'>
                    Place this code in the &lt;HEAD&gt; section of your website
                    or in Google Tag Manager:
                  </p>
                  <div className='bg-grayModern-100 text-xs px-3 rounded-md  font-mono flex py-2 gap-2 items-start'>
                    {code}
                    <IconButton
                      size='xs'
                      variant='ghost'
                      aria-label='Copy'
                      onClick={() =>
                        copyToClipboard(code, 'Code snippet copied')
                      }
                      icon={
                        <Icon name='copy-03' className='text-grayModern-500' />
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <InfoDialog
        confirmButtonLabel='Close'
        isOpen={usecase.isInfoOpen}
        label='Update your DNS settings'
        onClose={() => usecase.toggleInfo()}
        onConfirm={() => usecase.toggleInfo()}
        body={
          <p>
            To finish setting up your tracker, add a DNS record with your domain
            provider. This lets us route traffic through your{' '}
            <span className='font-medium'>
              {webtracker.cnameHost}.{webtracker.domain}
            </span>{' '}
            subdomain— so you can bypass ad blockers, generate up to 30% more
            leads, and keep everything under your own domain.
          </p>
        }
      />
      <ConfirmDeleteDialog
        label='Delete this website?'
        confirmButtonLabel='Delete website'
        onConfirm={() => usecase.archive()}
        isOpen={usecase.isConfirmDeleteOpen}
        onClose={() => usecase.toggleConfirmDelete()}
        description={
          <p>
            When you delete{' '}
            <span className='font-medium'>{webtracker.domain}</span>, it will
            stop tracking its visitors
          </p>
        }
      />
    </>
  );
});
