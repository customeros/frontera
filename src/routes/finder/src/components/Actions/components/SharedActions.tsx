import { Contact } from '@store/Contacts/Contact.dto';
import { CommandMenuType } from '@store/UI/CommandMenu.store.ts';
import { ActionItem } from '@finder/components/Actions/components/ActionItem.tsx';

import { X } from '@ui/media/icons/X.tsx';
import { ButtonGroup } from '@ui/form/ButtonGroup';
import { Grid01 } from '@ui/media/icons/Grid01.tsx';
import { Delete } from '@ui/media/icons/Delete.tsx';
import { Archive } from '@ui/media/icons/Archive.tsx';
import { TableInstance } from '@ui/presentation/Table';
import { isUserPlatformMac } from '@utils/getUserPlatform.ts';

interface TableActionsProps {
  onHide: () => void;
  selectCount: number;
  onOpenCommandK: () => void;
  table: TableInstance<Contact>;
  enableKeyboardShortcuts?: boolean;
  handleOpen: (type: CommandMenuType) => void;
}

export const SharedTableActions = ({
  table,
  onOpenCommandK,
  onHide,
  selectCount,
}: TableActionsProps) => {
  const clearSelection = () => table.resetRowSelection();

  if (!selectCount) return null;

  return (
    <>
      <ButtonGroup
        variant='old'
        className='flex items-center translate-x-[-50%] justify-center bottom-[32px] *:border-none'
      >
        {selectCount && (
          <div className='bg-grayModern-700 px-3 py-2 rounded-s-lg'>
            <p
              onClick={clearSelection}
              className='text-grayModern-25 text-sm font-semibold text-nowrap leading-5 outline-dashed outline-1 rounded-[2px] ougrayModerne-grayModern-400 pl-2 prgrayModernover:bg-grayModern-800 transition-colors cursor-pointer'
            >
              {`${selectCount} selected`}
              <span className='ml-1'>
                <X />
              </span>
            </p>
          </div>
        )}

        <ActionItem
          onClick={() => onHide()}
          dataTest='actions-archive'
          icon={<Archive className='text-inherit size-3' />}
          tooltip={
            <div className='flex gap-1'>
              <span className='text-sm'>Archive</span>
              <div className='bg-grayModern-600  min-h-5 min-w-5 rounded flex justify-center items-center'>
                {isUserPlatformMac() ? '⌘' : 'Ctrl'}
              </div>
              <div className='bg-grayModern-600  min-h-5 min-w-5 rounded flex justify-center items-center'>
                <Delete className='text-inherit' />
              </div>
            </div>
          }
        >
          Archive
        </ActionItem>
        <ActionItem
          onClick={onOpenCommandK}
          dataTest='org-actions-commandk'
          icon={<Grid01 className='size-3 text-inherit' />}
        >
          Actions
        </ActionItem>
      </ButtonGroup>
    </>
  );
};
