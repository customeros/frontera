import { Icon } from '@ui/media/Icon';
import { SidenavItem } from '@shared/components/RootSidenav/components/SidenavItem';

interface PersonalSectionProps {
  handleItemClick: (item: string) => () => void;
  checkIsActive: (
    path: string,
    options?: { preset: string | Array<string> },
  ) => boolean;
}

export const PersonalSection = ({
  handleItemClick,
  checkIsActive,
}: PersonalSectionProps) => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2 px-3'>
        <Icon name='user-01' className='w-4 h-4 text-grayModern-500' />
        <span className='text-sm  text-grayModern-700'>Personal</span>
      </div>
      <div className='ml-[23px]'>
        <SidenavItem
          label='Mailboxes'
          isActive={checkIsActive('mailboxes')}
          onClick={handleItemClick('mailboxes')}
        />
        {/* <SidenavItem
          label='LinkedIn'
          isActive={checkIsActive('linkedin')}
          onClick={handleItemClick('linkedin')}
        /> */}
      </div>
    </div>
  );
};
