import { Building03 } from '@ui/media/icons/Building03';
import { SidenavItem } from '@shared/components/RootSidenav/components/SidenavItem';

interface WorkspaceSectionProps {
  handleItemClick: (item: string) => () => void;
  checkIsActive: (
    path: string,
    options?: { preset: string | Array<string> },
  ) => boolean;
}

export const WorkspaceSection = ({
  handleItemClick,
  checkIsActive,
}: WorkspaceSectionProps) => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2 px-3'>
        <Building03 className='w-4 h-4 text-grayModern-500' />
        <span className='text-sm  text-grayModern-700'>Workspace</span>
      </div>
      <div className='ml-[23px]'>
        <SidenavItem
          label='General'
          isActive={checkIsActive('general')}
          onClick={handleItemClick('general')}
        />
        <SidenavItem
          label='Tags'
          isActive={checkIsActive('tags')}
          onClick={handleItemClick('tags')}
        />
        <SidenavItem
          label='API'
          isActive={checkIsActive('api')}
          onClick={handleItemClick('api')}
        />
        <SidenavItem
          label='Mailboxes'
          dataTest='sideNav-settings-mailboxes'
          isActive={checkIsActive('mailboxes')}
          onClick={handleItemClick('mailboxes')}
        />
        <SidenavItem
          label='Products'
          dataTest='sideNav-settings-products'
          isActive={checkIsActive('products')}
          onClick={handleItemClick('products')}
        />
      </div>
    </div>
  );
};
