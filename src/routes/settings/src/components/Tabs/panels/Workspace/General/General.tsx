import { useState } from 'react';

import { cn } from '@ui/utils/cn';
import { X } from '@ui/media/icons/X';
import { Input } from '@ui/form/Input';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { toastError } from '@ui/presentation/Toast';
import { ImagePlus } from '@ui/media/icons/ImagePlus';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { outlineButton } from '@ui/form/Button/Button.variants';
import { FileDropUploader, FileUploadTrigger } from '@ui/form/FileUploader';

type UploadResponse = {
  status: string;
  requestId: string;
  publicUrl: string;
};

export const General = () => {
  const store = useStore();
  const [name, setName] = useState(
    () => store.settings.tenant.value?.workspaceName,
  );

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [_triggerRender, setTriggerRender] = useState(false);

  const handelLoad = () => setIsLoading(true);
  const clearLoad = () => setIsLoading(false);

  const handleError = (_refId: number, error: string) => {
    clearLoad();
    setFile(null);
    toastError(error, 'upload-file');
  };

  const handleLoadEnd = () => {
    setFile(null);
    clearLoad();
  };

  const handleTenantLogoUpdate = (_refId: number, res: unknown) => {
    const { publicUrl } = res as UploadResponse;

    store.settings.tenant.update((value) => {
      value.workspaceLogoUrl = publicUrl;

      return value;
    });
    clearLoad();
  };

  const handleTenantLogoRemove = () => {
    store.settings.tenant.update((value) => {
      value.workspaceLogoUrl = '';

      return value;
    });
    setFile(null);
    setTriggerRender((prev) => !prev);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    store.settings.tenant.update((tenant) => {
      tenant.workspaceName = value;

      return tenant;
    });
  };

  return (
    <div className='px-6 pb-4 pt-2 max-w-[500px] border-r border-grayModern-200 h-full'>
      <div className='flex flex-col gap-4'>
        <p className='text-grayModern-700 font-semibold'>General</p>
        <div className='flex flex-col'>
          <div className='flex justify-between items-center'>
            <p className='text-sm text-grayModern-900 w-fit whitespace-nowrap font-medium'>
              Workspace logo
            </p>
          </div>

          <FileDropUploader
            onChange={setFile}
            onError={handleError}
            onLoadStart={handelLoad}
            onLoadEnd={handleLoadEnd}
            apiBaseUrl='/workspace-logo'
            onDragOverChange={setIsDragging}
            onSuccess={handleTenantLogoUpdate}
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
                {!store.settings.tenant.value?.workspaceLogoUrl && !file && (
                  <Tooltip
                    hasArrow
                    align='start'
                    side='bottom'
                    label='Upload a square logo no bigger than 1MB'
                  >
                    <FileUploadTrigger
                      onChange={setFile}
                      name='logoUploader'
                      onError={handleError}
                      onLoadStart={handelLoad}
                      onLoadEnd={handleLoadEnd}
                      apiBaseUrl='/workspace-logo'
                      onSuccess={handleTenantLogoUpdate}
                      endpointOptions={{
                        fileKeyName: 'file',
                        uploadUrl: '',
                      }}
                      className={cn(
                        outlineButton({ colorScheme: 'grayModern' }),
                        'hover:bg-grayModern-100 p-1 rounded-md cursor-pointergrayModernt-grayModern-500',
                        isLoading && 'opacity-50 pointer-events-none',
                      )}
                    >
                      <ImagePlus className='size-6 cursor-pointer' />
                    </FileUploadTrigger>
                  </Tooltip>
                )}

                {store.settings.tenant.value?.workspaceLogoUrl && !file && (
                  <div className='relative max-h-16 w-fit group'>
                    <img
                      className='h-10 rounded-md'
                      src={store.settings.tenant.value?.workspaceLogoUrl}
                    />
                    <IconButton
                      size='xxs'
                      icon={<X />}
                      variant='outline'
                      aria-label='Remove Logo'
                      onClick={handleTenantLogoRemove}
                      className='absolute bg-white bg-opacity-50 -top-[9px] -right-[10px] rounded-full size-5 opacity-0 group-hover:opacity-100'
                    />
                  </div>
                )}

                {!store.settings.tenant.value?.workspaceLogoUrl && file && (
                  <img
                    src={`${URL.createObjectURL(file)}`}
                    className='max-h-16 animate-pulseOpacity rounded-md'
                  />
                )}
                <div>
                  <label className='font-medium text-sm'>Company name</label>
                  <Input
                    size='sm'
                    variant='outline'
                    value={name || ''}
                    placeholder='Workspace name'
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
              </div>
            )}
          </FileDropUploader>
        </div>
      </div>
    </div>
  );
};
