import { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { Portal } from '@radix-ui/react-portal';
import { DocumentRenameModal } from '@domain/components/document';
import { DocumentDeleteDialog } from '@domain/components/document/document-delete-dialog';
import { DocumentIconChangeUsecase } from '@domain/usecases/document/document-icon-change.usecase';

import { cn } from '@ui/utils/cn';
// import { Avatar } from '@ui/media/Avatar';
import { Icon, IconName } from '@ui/media/Icon';
import { Editor } from '@ui/form/Editor/Editor';
import { IconButton } from '@ui/form/IconButton';
import { IconPicker } from '@ui/form/IconPicker';
import { useStore } from '@shared/hooks/useStore';
import { useChannel } from '@shared/hooks/useChannel';
// import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';
import {
  ScrollAreaRoot,
  ScrollAreaThumb,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
} from '@ui/utils/ScrollArea';

type ViewMode = 'fullscreen' | 'default';

interface DocumentEditorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const DocumentEditor = observer(
  ({ viewMode, onViewModeChange }: DocumentEditorProps) => {
    const store = useStore();
    const { id } = useParams();
    const [params, setParams] = useSearchParams();
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [openRename, setOpenRename] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

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
    const _authorPhoto =
      author && store.files.getById(author.value.profilePhotoUrl);

    const usecase = useMemo(
      () => new DocumentIconChangeUsecase(store.documents)!,
      [store.documents],
    );

    const closeEditor = () => {
      setParams((prev) => {
        prev.delete('doc');

        return prev;
      });
    };

    const [_ring, bg, iconColor] =
      colorMap[(doc?.value?.color as string) ?? 'grayModern'];

    useEffect(() => {
      usecase?.init(docId);
    }, [docId, doc]);

    return (
      <>
        <div
          className={cn(
            'relative w-full h-full bg-white',
            isFullscreen &&
              'absolute top-0 left-0 bottom-0 right-0 z-10 overflow-auto',
          )}
        >
          <div className='relative bg-white h-full mx-auto max-w-[680px] pt-2'>
            <div className='flex items-center w-full justify-between mb-3'>
              <Popover open={showIconPicker} onOpenChange={setShowIconPicker}>
                <PopoverTrigger className={'group'}>
                  {doc?.value.icon && (
                    <div
                      className={cn(
                        'flex items-center rounded-md p-[5px] bg-grayModern-100',
                        bg,
                      )}
                    >
                      <Icon
                        name={doc?.value.icon as IconName}
                        className={cn('size-5', iconColor)}
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
                      onClick={() => setOpenRename(true)}
                    >
                      <Icon
                        name='edit-03'
                        className='text-grayModern-500 group-hover/rename:text-grayModern-700'
                      />{' '}
                      Rename
                    </MenuItem>
                    <MenuItem
                      className='group/archive'
                      onClick={() => setOpenDelete(true)}
                    >
                      <Icon
                        name='archive'
                        className='text-grayModern-500 group-hover/archive:text-grayModern-700'
                      />{' '}
                      Archive
                    </MenuItem>
                  </MenuList>
                </Menu>

                <IconButton
                  size='xs'
                  variant='ghost'
                  aria-label='toggle view mode'
                  onClick={() =>
                    onViewModeChange(
                      viewMode === 'default' ? 'fullscreen' : 'default',
                    )
                  }
                  icon={
                    <Icon
                      name={
                        viewMode === 'default' ? 'expand-01' : 'collapse-01'
                      }
                    />
                  }
                />

                <IconButton
                  size='xs'
                  variant='ghost'
                  onClick={closeEditor}
                  aria-label='close document'
                  icon={<Icon name='x-close' />}
                />
              </div>
            </div>

            <div className='w-full flex gap-4 items-center justify-between mb-4'>
              <h1 className='text-lg font-medium line-clamp-2'>
                {doc?.value.name}
              </h1>

              {/* <div className='flex items-center gap-2'>
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
              </div> */}
            </div>

            {doc?.value.id && (
              <Editor
                useYjs
                size='sm'
                user={presenceUser}
                documentId={doc?.value.id}
                namespace='organization-document-editor'
              />
            )}
          </div>
        </div>

        <DocumentRenameModal
          docId={docId}
          open={openRename}
          onOpenChange={setOpenRename}
        />

        <DocumentDeleteDialog
          docId={docId}
          open={openDelete}
          onOpenChange={setOpenDelete}
        />
      </>
    );
  },
);

/**
 * It's necessary to toggle the viewmode here and not inside the editor in order to force a full remount
 * of the DocumentEditor. In production, document breaks down when toggling from one viewMode to another
 * Remounting entirely solves this problem as any Editor related caching or memoization is garbage-collected.
 */
export const WrappedDocumentEditor = () => {
  const [viewMode, setViewMode] = useState<'fullscreen' | 'default'>('default');

  return viewMode === 'fullscreen' ? (
    <Portal container={document.getElementById('organization-profile-main')}>
      <DocumentEditor viewMode={viewMode} onViewModeChange={setViewMode} />
    </Portal>
  ) : (
    <ScrollAreaRoot>
      <ScrollAreaViewport>
        <DocumentEditor viewMode={viewMode} onViewModeChange={setViewMode} />
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation='vertical'>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollAreaRoot>
  );
};

const colorMap: Record<string, string[]> = {
  grayModern: [
    'hover:ring-grayModern-400',
    'bg-grayModern-50',
    'text-grayModern-500',
  ],
  error: ['hover:ring-error-400', 'bg-error-50', 'text-error-500'],
  warning: ['hover:ring-warning-400', 'bg-warning-50', 'text-warning-500'],
  success: ['hover:ring-success-400', 'bg-success-50', 'text-success-500'],
  grayWarm: ['hover:ring-grayWarm-400', 'bg-grayWarm-50', 'text-grayWarm-500'],
  moss: ['hover:ring-moss-400', 'bg-moss-50', 'text-moss-500'],
  blueLight: [
    'hover:ring-blueLight-400',
    'bg-blueLight-50',
    'text-blueLight-500',
  ],
  indigo: ['hover:ring-indigo-400', 'bg-indigo-50', 'text-indigo-500'],
  violet: ['hover:ring-violet-400', 'bg-violet-50', 'text-violet-500'],
  pink: ['hover:ring-pink-400', 'bg-pink-50', 'text-pink-500'],
};
