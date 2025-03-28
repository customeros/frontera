import { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { DocumentRenameModal } from '@domain/components/document';
import { DocumentDeleteDialog } from '@domain/components/document/document-delete-dialog';
import { DocumentIconChangeUsecase } from '@domain/usecases/document/document-icon-change.usecase';

import { cn } from '@ui/utils/cn';
import { Avatar } from '@ui/media/Avatar';
import { Icon, IconName } from '@ui/media/Icon';
import { Editor } from '@ui/form/Editor/Editor';
import { IconButton } from '@ui/form/IconButton';
import { IconPicker } from '@ui/form/IconPicker';
import { useStore } from '@shared/hooks/useStore';
import { Divider } from '@ui/presentation/Divider';
import { useChannel } from '@shared/hooks/useChannel';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';
import {
  ScrollAreaRoot,
  ScrollAreaThumb,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
} from '@ui/utils/ScrollArea';

export const DocumentEditor = observer(() => {
  const store = useStore();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [openRename, setOpenRename] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const viewMode = params.get('viewMode') ?? 'default';

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
  const authorPhoto =
    author && store.files.getById(author.value.profilePhotoUrl);

  const usecase = useMemo(
    () => new DocumentIconChangeUsecase(store.documents)!,
    [store.documents],
  );

  const handleViewModeChange = () => {
    setParams((p) => {
      if (viewMode === 'default') {
        p.set('viewMode', 'focus');
      } else {
        p.delete('viewMode');
      }

      return p;
    });
  };

  const closeEditor = () => {
    setParams((prev) => {
      prev.delete('doc');
      prev.delete('viewMode');

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
      <ScrollAreaRoot>
        <ScrollAreaViewport>
          <div className={cn('relative w-full h-full bg-white animate-fadeIn')}>
            <div className='relative bg-white h-full mx-auto max-w-[680px] pt-2'>
              <div className='flex items-center w-full justify-between mb-3'>
                <Popover open={showIconPicker} onOpenChange={setShowIconPicker}>
                  <PopoverTrigger>
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
                    onClick={handleViewModeChange}
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

              <div className='w-full flex flex-col justify-between'>
                <h1 className='text-lg font-medium line-clamp-2'>
                  {doc?.value.name}
                </h1>

                <div className='flex items-center gap-2'>
                  <Tooltip
                    asChild
                    hasArrow
                    side='bottom'
                    label={author?.value.name}
                  >
                    <div className='items-center'>
                      <Avatar
                        size='xxs'
                        variant='circle'
                        src={authorPhoto}
                        name={author?.value.name}
                        icon={
                          <Icon
                            name='user-01'
                            className='text-grayModern-500'
                          />
                        }
                      />
                    </div>
                  </Tooltip>

                  <span className='text-xs leading-none text-nowrap text-grayModern-500'>
                    created 12 Jan 2025
                  </span>
                </div>
              </div>

              <Divider className='my-4' />

              {doc?.value.id && (
                <Editor
                  useYjs
                  size='sm'
                  key={doc?.value.id}
                  user={presenceUser}
                  documentId={doc?.value.id}
                  namespace='organization-document-editor'
                />
              )}

              <div className='h-20 w-full'></div>
            </div>
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation='vertical'>
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollAreaRoot>

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
});

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
