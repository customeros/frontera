import { useParams, useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { observer } from 'mobx-react-lite';
import { Portal } from '@radix-ui/react-portal';
import { UpdateDocumentUsecase } from '@domain/usecases/organization-details/update-document.usecase';
import { DeleteDocumentUsecase } from '@domain/usecases/organization-details/delete-document.usecase';

import { cn } from '@ui/utils/cn';
import { Input } from '@ui/form/Input';
import { Avatar } from '@ui/media/Avatar';
import { Icon, IconName } from '@ui/media/Icon';
import { Editor } from '@ui/form/Editor/Editor';
import { Button } from '@ui/form/Button/Button';
import { IconButton } from '@ui/form/IconButton';
import { IconPicker } from '@ui/form/IconPicker';
import { useStore } from '@shared/hooks/useStore';
import { useChannel } from '@shared/hooks/useChannel';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { ConfirmDialog } from '@ui/overlay/AlertDialog/ConfirmDialog';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';
import {
  ScrollAreaRoot,
  ScrollAreaThumb,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
} from '@ui/utils/ScrollArea';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
} from '@ui/overlay/Modal';

export const DocumentEditor = observer(() => {
  const store = useStore();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'fullscreen' | 'default'>('default');
  const { presentUsers, currentUserId } = useChannel(
    `organization_presence:${id}`,
  );

  const presenceUser = useMemo(() => {
    const found = presentUsers.find((u) => u.user_id === currentUserId);

    if (!found?.username || !found?.color) return undefined;

    return {
      username: found.username,
      cursorColor: found.color,
    };
  }, [currentUserId, presentUsers]);

  const docId = params.get('doc')!;
  const doc = store.documents.getById(docId);
  const author = doc && store.users.getById(doc.value.userId);
  const isFullscreen = viewMode === 'fullscreen';
  const authorPhoto =
    author && store.files.getById(author.value.profilePhotoUrl);

  const usecase = useMemo(
    () => new UpdateDocumentUsecase(store.documents)!,
    [store.documents],
  );
  const deleteUsecase = useMemo(
    () => new DeleteDocumentUsecase(store.documents)!,
    [store.documents],
  );

  const closeEditor = () => {
    setParams((prev) => {
      prev.delete('doc');

      return prev;
    });
  };

  const Wrapper = useCallback(
    observer(({ children }: { children: React.ReactNode }) =>
      viewMode === 'fullscreen' ? (
        <Portal
          container={document.getElementById('organization-profile-main')}
        >
          {children}
        </Portal>
      ) : (
        <ScrollAreaRoot>
          <ScrollAreaViewport>{children}</ScrollAreaViewport>
          <ScrollAreaScrollbar orientation='vertical'>
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </ScrollAreaRoot>
      ),
    ),
    [docId, viewMode, doc],
  );

  const [_ring, bg, iconColor] =
    colorMap[(doc?.value?.color as string) ?? 'grayModern'];

  useEffect(() => {
    usecase?.init(docId);
    deleteUsecase?.init(docId);
  }, [docId]);

  return (
    <Wrapper>
      <div
        className={cn(
          'relative w-full h-full bg-white',
          isFullscreen &&
            'absolute top-0 left-0 bottom-0 right-0 z-10 overflow-auto',
        )}
      >
        <div className='relative bg-white h-full w-[41rem] mx-auto pt-2'>
          <div className='flex items-center w-full justify-between mb-3'>
            <Popover open={showIconPicker} onOpenChange={setShowIconPicker}>
              <PopoverTrigger className={'group'}>
                {doc?.value.icon && (
                  <div
                    className={cn(
                      'flex items-center rounded-md p-[5px] bg-grayModern-100',
                      bg,
                      {
                        [bg?.replace('group-hover:', '')]: showIconPicker,
                      },
                    )}
                  >
                    <Icon
                      name={doc?.value.icon as IconName}
                      className={cn('size-5', iconColor, {
                        [iconColor?.replace('group-hover:', '')]:
                          showIconPicker,
                      })}
                    />
                  </div>
                )}
              </PopoverTrigger>

              <PopoverContent
                align='start'
                className='p-4 bg-grayModern-700 border-0'
              >
                <IconPicker
                  icon={doc?.value.icon as IconName}
                  color={doc?.value.color ?? 'grayModern'}
                  onIconChange={(i) => usecase?.executeIconChange(i)}
                  onColorChange={(c) => usecase?.executeColorChange(c)}
                />
              </PopoverContent>
            </Popover>

            <div className='flex items-center gap-1'>
              <IconButton
                size='xs'
                variant='ghost'
                aria-label='toggle view mode'
                icon={
                  <Icon
                    name={viewMode === 'default' ? 'expand-01' : 'collapse-01'}
                  />
                }
                onClick={() =>
                  setViewMode((prev) =>
                    prev === 'default' ? 'fullscreen' : 'default',
                  )
                }
              />

              <IconButton
                size='xs'
                variant='ghost'
                onClick={closeEditor}
                icon={<Icon name='x' />}
                aria-label='close document'
              />
            </div>
          </div>

          <div className='w-full flex gap-4 items-center justify-between mb-4'>
            <div className='flex items-center gap-1'>
              <h1 className='text-lg font-medium line-clamp-1'>
                {doc?.value.name}
              </h1>
              <Menu>
                <MenuButton asChild>
                  <IconButton
                    size='xs'
                    variant='ghost'
                    aria-label='more actions'
                    icon={<Icon name='dots-vertical' />}
                  />
                </MenuButton>
                <MenuList align='start'>
                  <MenuItem
                    className='group/rename'
                    onClick={() => usecase?.toggleRename(true)}
                  >
                    <Icon
                      name='edit-03'
                      className='text-grayModern-500 group-hover/rename:text-grayModern-700'
                    />{' '}
                    Rename
                  </MenuItem>
                  <MenuItem
                    className='group/archive'
                    onClick={() => deleteUsecase?.toggleConfirmation(true)}
                  >
                    <Icon
                      name='archive'
                      className='text-grayModern-500 group-hover/archive:text-grayModern-700'
                    />{' '}
                    Archive
                  </MenuItem>
                </MenuList>
              </Menu>
            </div>

            <div className='flex items-center gap-2'>
              <Tooltip hasArrow side='bottom' label={author?.value.name}>
                <div>
                  <Avatar
                    size='xs'
                    src={authorPhoto}
                    variant='outlineCircle'
                    name={author?.value.name}
                    icon={
                      <Icon name='user-01' className='text-grayModern-500' />
                    }
                  />
                </div>
              </Tooltip>

              <span className='text-sm text-nowrap text-grayModern-500'>
                created 12 Jan 2025
              </span>
            </div>
          </div>

          <Editor
            useYjs
            user={presenceUser}
            documentId={doc?.value.id}
            namespace='organization-document-editor'
          />
        </div>
      </div>

      <Modal
        open={usecase?.isRenameModalOpen}
        onOpenChange={(v) => usecase?.toggleRename(v)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader className='font-medium'>Rename document</ModalHeader>
          <ModalBody>
            <Input
              size='xs'
              placeholder='Document name'
              value={usecase?.renameValue}
              invalid={!!usecase?.renameValidation}
              onChange={(e) => usecase?.setRenameValue(e.target.value)}
            />
            {!!usecase?.renameValidation && <p>{usecase?.renameValidation}</p>}
          </ModalBody>
          <ModalFooter className='flex gap-3 justify-between'>
            <Button
              className='flex-1'
              onClick={() => usecase?.toggleRename(false)}
            >
              Cancel
            </Button>
            <Button
              className='flex-1'
              colorScheme='primary'
              onClick={usecase?.execute}
              isDisabled={!!usecase?.renameValidation}
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        confirmButtonLabel='Archive'
        title='Archive this document?'
        onConfirm={() => deleteUsecase?.execute()}
        onClose={() => deleteUsecase?.toggleConfirmation(false)}
        isOpen={deleteUsecase?.isDeleteConfirmationOpen ?? false}
      ></ConfirmDialog>
    </Wrapper>
  );
});

const colorMap: Record<string, string[]> = {
  grayModern: [
    'hover:ring-grayModern-400',
    'group-hover:bg-grayModern-50',
    'group-hover:text-grayModern-500',
  ],
  error: [
    'hover:ring-error-400',
    'group-hover:bg-error-50',
    'group-hover:text-error-500',
  ],
  warning: [
    'hover:ring-warning-400',
    'group-hover:bg-warning-50',
    'group-hover:text-warning-500',
  ],
  success: [
    'hover:ring-success-400',
    'group-hover:bg-success-50',
    'group-hover:text-success-500',
  ],
  grayWarm: [
    'hover:ring-grayWarm-400',
    'group-hover:bg-grayWarm-50',
    'group-hover:text-grayWarm-500',
  ],
  moss: [
    'hover:ring-moss-400',
    'group-hover:bg-moss-50',
    'group-hover:text-moss-500',
  ],
  blueLight: [
    'hover:ring-blueLight-400',
    'group-hover:bg-blueLight-50',
    'group-hover:text-blueLight-500',
  ],
  indigo: [
    'hover:ring-indigo-400',
    'group-hover:bg-indigo-50',
    'group-hover:text-indigo-500',
  ],
  violet: [
    'hover:ring-violet-400',
    'group-hover:bg-violet-50',
    'group-hover:text-violet-500',
  ],
  pink: [
    'hover:ring-pink-400',
    'group-hover:bg-pink-50',
    'group-hover:text-pink-500',
  ],
};
