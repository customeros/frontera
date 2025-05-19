import { useMemo, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { SettingsProfileUseCase } from '@domain/usecases/settings/profile/settings-profile.usecase';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Input } from '@ui/form/Input';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { toastError } from '@ui/presentation/Toast';
import { ImagePlus } from '@ui/media/icons/ImagePlus';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { outlineButton } from '@ui/form/Button/Button.variants';
import { FileDropUploader, FileUploadTrigger } from '@ui/form/FileUploader';

type UploadResponse = {
  id: string;
  size: number;
  cdnUrl: string;
  fileName: string;
  mimeType: string;
  previewUrl: string;
  downloadUrl: string;
};

export const Profile = observer(() => {
  const store = useStore();

  const [file, setFile] = useState<File | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [_triggerRender, setTriggerRender] = useState(false);

  const usecase = useMemo(
    () => new SettingsProfileUseCase(store.session.value.profile.id),
    [],
  );

  const handleError = (_refId: number, error: string) => {
    toastError(error, 'upload-file');
  };

  const handleTenantLogoUpdate = (_refId: number, res: unknown) => {
    const { cdnUrl } = res as UploadResponse;

    usecase.updateUserProfilePhotoUrl(cdnUrl);
    usecase.updateUser();
  };

  const handleTenantLogoRemove = () => {
    usecase.updateUserProfilePhotoUrl('');
    usecase.updateUser();
    setTriggerRender((prev) => !prev);
  };

  return (
    <div className='px-6 pb-4 pt-2 max-w-[500px] border-r border-grayModern-200 h-full'>
      <div className='flex flex-col gap-4'>
        <p className='text-grayModern-700  font-semibold'>Profile</p>
        <div className='flex flex-col'>
          <div className='flex justify-between items-center'>
            <p className='text-sm text-grayModern-900 w-fit whitespace-nowrap font-medium'>
              Profile picture
            </p>
          </div>

          <FileDropUploader
            onChange={setFile}
            onError={handleError}
            apiBaseUrl='/user-logo'
            onDragOverChange={setIsDragging}
            onSuccess={handleTenantLogoUpdate}
            onLoadEnd={() => setHasLoaded(true)}
            endpointOptions={{
              fileKeyName: 'file',
              uploadUrl: '',
            }}
          >
            {isDragging ? (
              <div className='p-4 border border-dashed border-grayModern-300 rounded-lg text-center'>
                <p className='text-sm text-grayModern-500'>
                  Drag and drop PNG or JPG (Max 150KB)
                </p>
              </div>
            ) : (
              <div className='flex flex-col items-start gap-4 justify-between min-h-5 pt-2'>
                {!usecase.userProfilePhotoUrl && !file && (
                  <Tooltip
                    hasArrow
                    align='start'
                    side='bottom'
                    label='Upload a logo no bigger than 1MB'
                  >
                    <FileUploadTrigger
                      onChange={setFile}
                      onError={handleError}
                      apiBaseUrl='/user-logo'
                      name='company-logo-uploader'
                      onSuccess={handleTenantLogoUpdate}
                      onLoadEnd={() => setHasLoaded(true)}
                      endpointOptions={{
                        fileKeyName: 'file',
                        uploadUrl: '',
                      }}
                      className={cn(
                        outlineButton({ colorScheme: 'grayModern' }),
                        'hover:bg-grayModern-100 p-1 rounded-md cursor-pointergrayModernt-grayModern-500',
                        hasLoaded && 'opacity-50 pointer-events-none',
                      )}
                    >
                      <ImagePlus className='size-6 cursor-pointer' />
                    </FileUploadTrigger>
                  </Tooltip>
                )}

                {store.users.getById(usecase.userId)?.value
                  .profilePhotoUrlV2 && (
                  <div className='relative max-h-16 w-fit group'>
                    <img
                      src={
                        store.users.getById(usecase.userId)?.value
                          .profilePhotoUrlV2 ?? ''
                      }
                      className={cn(
                        'size-12 rounded-full aspect-square object-cover',
                        (file || !usecase.userProfilePhotoUrl) &&
                          'grayscale filter blur-sm rounded-full',
                        hasLoaded &&
                          'grayscale-0 blur-none animate-fadeOutFilteredGrayscale rounded-full',
                      )}
                    />
                    <IconButton
                      size='xxs'
                      variant='outline'
                      icon={<Icon name='x' />}
                      aria-label='Remove Logo'
                      className='absolute bg-white bg-opacity-50 -top-[9px] -right-[10px] rounded-full size-5 opacity-0 group-hover:opacity-100'
                      onClick={() => {
                        handleTenantLogoRemove();
                        setFile(null);
                        setHasLoaded(false);
                      }}
                    />
                  </div>
                )}

                <div>
                  <label className='font-medium text-sm'>
                    First & last name
                  </label>
                  <Input
                    size='sm'
                    variant='outline'
                    value={usecase.userName || ''}
                    placeholder='First & last name'
                    onBlur={() => usecase.updateUser()}
                    onChange={(e) => usecase.updateUserName(e.target.value)}
                  />
                </div>
                <div>
                  <p className='font-medium text-sm'>Email</p>
                  <p>{store.session.value.profile?.email}</p>
                </div>
              </div>
            )}
          </FileDropUploader>
        </div>
      </div>
    </div>
  );
});
