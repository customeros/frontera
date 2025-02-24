import { useState } from 'react';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Image } from '@ui/media/Image/Image';
import { IconButton } from '@ui/form/IconButton';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import {
  UploadResponse,
  FileDropUploader,
  FileUploadTrigger,
} from '@ui/form/FileUploader';

interface CompanyLogoProps {
  value: string;
  onRemove: () => void;
  onError: (refId: number, error: string) => void;
  onChange: (refId: number, value: UploadResponse) => void;
}

export const CompanyLogo = observer(
  ({ value, onChange, onError, onRemove }: CompanyLogoProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const imageSrc =
      (file ? `${URL.createObjectURL(file)}` : undefined) ?? value;

    return (
      <div>
        <div className='flex items-center justify-between'>
          <label className='text-sm font-medium'>Company Logo</label>
          <FileUploadTrigger
            onError={onError}
            onChange={setFile}
            apiBaseUrl='/files'
            onSuccess={onChange}
            onLoadEnd={() => setHasLoaded(true)}
            name='company-logo-uploader-icon-button'
            endpointOptions={{
              fileKeyName: 'file',
              uploadUrl: '',
            }}
            className='cursor-pointer hover:bg-grayModern-100 rounded-md leading-none p-0.5 transition-colors group'
          >
            <label
              className='cursor-pointer'
              htmlFor='company-logo-uploader-icon-button'
            >
              <Icon
                name='upload-01'
                className='text-grayModern-500 group-hover:text-grayModern-700'
              />
            </label>
          </FileUploadTrigger>
        </div>
        <FileDropUploader
          onError={onError}
          onChange={setFile}
          apiBaseUrl='/files'
          onSuccess={onChange}
          onDragOverChange={setIsDragging}
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
            <div className='flex  flex-1 items-center justify-between min-h-5 pt-2'>
              {!value && !file && (
                <Tooltip
                  hasArrow
                  align='start'
                  side='bottom'
                  label='Upload a logo no bigger than 1MB'
                >
                  <FileUploadTrigger
                    onError={onError}
                    onChange={setFile}
                    apiBaseUrl='/files'
                    onSuccess={onChange}
                    name='company-logo-uploader'
                    onLoadEnd={() => setHasLoaded(true)}
                    endpointOptions={{
                      fileKeyName: 'file',
                      uploadUrl: '',
                    }}
                  >
                    <label
                      htmlFor='company-logo-uploader'
                      className='text-sm text-grayModern-500 underline cursor-pointer hover:text-grayModern-700'
                    >
                      Upload a PNG or JPG (Max 1MB)
                    </label>
                  </FileUploadTrigger>
                </Tooltip>
              )}

              {imageSrc && (
                <div className='relative max-h-16 w-fit group'>
                  <Image
                    src={imageSrc}
                    className={cn(
                      'h-12',
                      (file || !value) && 'grayscale filter blur-sm',
                      hasLoaded &&
                        'grayscale-0 blur-none animate-fadeOutFilteredGrayscale',
                    )}
                  />
                  <IconButton
                    size='xxs'
                    variant='outline'
                    icon={<Icon name='x' />}
                    aria-label='Remove Logo'
                    className='absolute bg-white bg-opacity-50 -top-[9px] -right-[10px] rounded-full size-5 opacity-0 group-hover:opacity-100'
                    onClick={() => {
                      onRemove();
                      setFile(null);
                      setHasLoaded(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </FileDropUploader>
      </div>
    );
  },
);
