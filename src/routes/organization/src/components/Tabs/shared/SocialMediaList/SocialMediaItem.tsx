import { useMemo, useState } from 'react';

import { Social } from '@/domain/objects';
import { observer } from 'mobx-react-lite';
import { Organization } from '@/domain/entities';
import { OrganizationService } from '@/domain/services';

import { cn } from '@ui/utils/cn';
import { Button } from '@ui/form/Button/Button';
import { Trash01 } from '@ui/media/icons/Trash01';
import { Divider } from '@ui/presentation/Divider';
import { Copy01 } from '@ui/media/icons/Copy01.tsx';
import { Share03 } from '@ui/media/icons/Share03.tsx';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { formatSocialUrl } from '@ui/form/UrlInput/util';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { useDisclosure } from '@ui/utils/hooks/useDisclosure';
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/overlay/Popover';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogPortal,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseIconButton,
} from '@ui/overlay/AlertDialog/AlertDialog';

import { SocialIcon } from './SocialIcons';

interface SocialMediaItemProps {
  social: Social;
  index?: number;
  isReadOnly?: boolean;
  organization: Organization;
}

export const SocialMediaItem = observer(
  ({ social, organization }: SocialMediaItemProps) => {
    const [openActionBar, setIsOpenActionBar] = useState(false);
    const [_, copyToClipboard] = useCopyToClipboard();
    const { onClose, onOpen, open } = useDisclosure();
    const organizationService = useMemo(() => new OrganizationService(), []);

    const onDeleteConfirm = () => {
      organizationService.removeSocialMediaItem(organization, social);
    };

    const href = social.url.startsWith('http')
      ? social.url
      : `https://${social.url}`;

    return (
      <>
        <div className='group'>
          <div className='h-full relative flex items-center'>
            <div className='h-full flex items-center'>
              <div
                tabIndex={0}
                className='text-sm truncate cursor-default overflow-hidden overflow-ellipsis'
              >
                <Popover open={openActionBar} onOpenChange={setIsOpenActionBar}>
                  <PopoverTrigger>
                    <Tooltip
                      asChild
                      label={social.url}
                      className='max-w-[300px] truncate'
                    >
                      <div>
                        <SocialIcon
                          url={social.url}
                          className={cn(
                            openActionBar &&
                              'border-[1px] border-grayModern-700 rounded-full ',
                          )}
                        />
                      </div>
                    </Tooltip>
                  </PopoverTrigger>
                  <PopoverContent
                    side='top'
                    className='bg-grayModern-700 z-[99999999]'
                  >
                    <div className=' flex items-center text-white'>
                      <span className='mr-2 text-sm truncate w-[150px]'>
                        {formatSocialUrl(social.url)}
                      </span>
                      <Divider className='bg-grayModern-500 w-3 rotate-90 h-[1px] border-0' />
                      <div className='flex gap-2'>
                        <IconButton
                          size='xs'
                          variant='ghost'
                          icon={<Share03 />}
                          colorScheme={'white'}
                          aria-label={'Open in the new tab'}
                          onClick={() =>
                            window.open(href, '_blank', 'noopener noreferrer')
                          }
                        />
                        <IconButton
                          size='xs'
                          variant='ghost'
                          icon={<Copy01 />}
                          colorScheme={'white'}
                          aria-label={'copy-social-link'}
                          onClick={() =>
                            copyToClipboard(social.url, 'Link copied')
                          }
                        />
                        <IconButton
                          size='xs'
                          variant='ghost'
                          icon={<Trash01 />}
                          colorScheme={'white'}
                          onClick={() => onOpen()}
                          aria-label={'delete-social-link'}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <DeleteModal
          open={open}
          onClose={onClose}
          onConfirm={onDeleteConfirm}
        />
      </>
    );
  },
);

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal = ({ onConfirm, onClose, open }: DeleteModalProps) => {
  return (
    <AlertDialog isOpen={open} onClose={onClose}>
      <AlertDialogPortal>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogCloseIconButton />
            <AlertDialogBody>
              <span className='font-medium'>Delete this social link?</span>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onClose}>Cancel</Button>
              <Button onClick={onConfirm} colorScheme='primary'>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
