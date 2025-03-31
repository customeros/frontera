import { useState } from 'react';

import { observer } from 'mobx-react-lite';
import { ContractStore } from '@store/Contracts/Contract.store.ts';

import { cn } from '@ui/utils/cn.ts';
import { Icon } from '@ui/media/Icon';
import { Plus } from '@ui/media/icons/Plus.tsx';
import { useStore } from '@shared/hooks/useStore';
import { toastError } from '@ui/presentation/Toast';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip.tsx';
import { Spinner } from '@ui/feedback/Spinner/Spinner.tsx';
import { Divider } from '@ui/presentation/Divider/Divider.tsx';
import { Tag, TagLabel, TagRightIcon } from '@ui/presentation/Tag';
import { outlineButton } from '@ui/form/Button/Button.variants.ts';
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

interface ContractUploaderProps {
  contractId: string;
}

export const ContractUploader = observer(
  ({ contractId }: ContractUploaderProps) => {
    const { contracts } = useStore();
    const contractStore = contracts.value.get(contractId) as ContractStore;
    const [files, setFiles] = useState<{ file: File; refId: number }[]>([]);
    const [loadingIds, setIsLoading] = useState<number[]>([]);
    const [_isDragging, setIsDragging] = useState(false);

    const attachments = contractStore?.value?.attachments;
    const handelLoad = (refId: number) =>
      setIsLoading((prev) => [...prev, refId]);
    const clearLoad = (refId: number) =>
      setIsLoading((prev) => prev.filter((id) => id !== refId));

    const handleError = (refId: number, error: string) => {
      clearLoad(refId);
      setFiles((prev) => prev.filter((file) => file.refId !== refId));
      toastError(error, 'upload-file');
    };

    const handleLoadEnd = (refId: number) => {
      clearLoad(refId);
      setFiles((prev) => prev.filter((file) => file.refId !== refId));
    };

    const handleAddAttachment = (refId: number, res: unknown) => {
      const { id } = res as UploadResponse;

      contractStore.addAttachment(id).then(() => {
        clearLoad(refId);
      });
    };

    const handleRemoveAttachment = (id: string) => {
      contractStore.removeAttachment(id);
    };

    return (
      <div className='flex flex-col'>
        <Divider className='my-3' />

        <div className='flex relative items-center justify-between '>
          <div className='flex relative font-medium items-center text-sm'>
            <Icon name='file-05' className='w-4 h-4 mr-2 text-grayModern-500' />
            <p className='flex items-center'>Contracts & documents</p>
          </div>
          <Tooltip
            hasArrow
            side='bottom'
            align='center'
            label='Upload a document'
          >
            <FileUploadTrigger
              apiBaseUrl='/files'
              name='contractUpload'
              onError={handleError}
              onLoadStart={handelLoad}
              onLoadEnd={handleLoadEnd}
              onSuccess={handleAddAttachment}
              endpointOptions={{
                fileKeyName: 'file',
                uploadUrl: '',
              }}
              onChange={(file, refId) => {
                setFiles((prev) => [...prev, { file, refId }]);
              }}
              className={cn(
                'p-[2px] rounded-[4px] cursor-pointer ml-[5px] outline-none focus:outline-none',
                loadingIds.length && 'opacity-50 pointer-events-none ',
                outlineButton({ colorScheme: 'grayModern' }),
              )}
            >
              <Plus tabIndex={-1} className='size-3 outline-none' />
            </FileUploadTrigger>
          </Tooltip>
        </div>

        <FileDropUploader
          apiBaseUrl='/files'
          onError={handleError}
          onLoadStart={handelLoad}
          onLoadEnd={handleLoadEnd}
          onSuccess={handleAddAttachment}
          onDragOverChange={setIsDragging}
          endpointOptions={{
            fileKeyName: 'file',
            uploadUrl: '',
          }}
          onChange={(file, refId) => {
            setFiles((prev) => [...prev, { file, refId }]);
          }}
        >
          <div className='min-h-5 gap-2'>
            {!attachments?.length && !files.length && (
              <label
                htmlFor='contractUpload'
                className='text-base text-grayModern-500 underline cursor-pointer'
              ></label>
            )}

            {attachments?.map(({ id, fileName }) => (
              <AttachmentItem
                id={id}
                key={id}
                fileName={fileName}
                href={`/files/${id}/download`}
                onRemove={handleRemoveAttachment}
              />
            ))}

            {files.map(({ file, refId }) => (
              <AttachmentItem
                href='#'
                key={refId}
                fileName={file.name}
                id={refId.toString()}
                isLoading={loadingIds.includes(refId)}
              />
            ))}
            <div className='p-4 border border-dashed border-grayModern-300 rounded-lg text-center mt-2'>
              <p className='text-sm text-grayModern-500'>
                <label
                  htmlFor='contractUpload'
                  className='text-sm text-grayModern-500 underline cursor-pointer'
                >
                  Click to upload{' '}
                </label>
                or Drag and drop
              </p>
            </div>
          </div>
        </FileDropUploader>
      </div>
    );
  },
);

interface AttachmentItemProps {
  id: string;
  href: string;
  fileName: string;
  isLoading?: boolean;
  onRemove?: (id: string) => void;
}

const AttachmentItem = observer(
  ({ id, fileName, onRemove, isLoading }: AttachmentItemProps) => {
    const { files } = useStore();

    const handleDownload = () => {
      const formattedFileName = fileName?.split('.')?.[0];

      files.downloadAttachment(id, formattedFileName);
      files.clear(id);
    };

    return (
      <div className='flex  items-center group mt-2 mb-3'>
        <Tag size='sm' colorScheme='grayModern' onClick={handleDownload}>
          <TagLabel className='line-clamp-1'>{fileName}</TagLabel>
          <TagRightIcon className='cursor-pointer'>
            <div>
              <Icon
                name='x-close'
                className='size-3 pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(id);
                }}
              />
            </div>
          </TagRightIcon>
        </Tag>

        {isLoading && (
          <Spinner
            size='sm'
            label='loading'
            className='text-grayModern-300grayModernl-grayModern-700'
          />
        )}
      </div>
    );
  },
);
