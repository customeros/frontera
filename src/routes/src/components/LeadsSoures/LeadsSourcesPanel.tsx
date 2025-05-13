import { useNavigate, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Logo } from '@ui/media/Logo';
import { Button } from '@ui/form/Button/Button';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

export const LeadsSourcesPanel = observer(() => {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preset = searchParams.get('preset');
  const orgPreset = store.tableViewDefs.organizationsPreset;
  const contactPreset = store.tableViewDefs.contactsPreset;

  const handleAddLeads = () => {
    if (preset === orgPreset) {
      store.ui.commandMenu.toggle('AddNewOrganization');
    } else if (preset === contactPreset) {
      store.ui.commandMenu.toggle('AddContactsBulk');
    }
  };

  return (
    <div className='flex flex-col'>
      <div className='flex items-center justify-between border-b border-grayModern-200 py-2 pl-3 pr-4'>
        <h1 className='font-medium'>Lead sources</h1>
        <IconButton
          size='xs'
          variant='ghost'
          aria-label='Close'
          icon={<Icon name='x-close' />}
          onClick={() => store.ui.setShowLeadSources(false)}
        />
      </div>
      <div className='flex flex-col space-y-4 p-4'>
        {/* <CardSource
          title='Website tracker'
          icon={<Icon name='radar' />}
          description='Automatically identify visitors from your website'
          action={
            <Button
              size='xxs'
              variant='ghost'
              leftIcon={<Icon name='edit-03' />}
              onClick={() => navigate('/settings?tab=website-tracker')}
            >
              Configure
            </Button>
          }
        /> */}
        <CardSource
          title='Team scheduling'
          icon={<Icon name='calendar' />}
          description="Capture leads by sharing your team's calendar"
          action={
            <Button
              size='xxs'
              variant='ghost'
              leftIcon={<Icon name='edit-03' />}
              onClick={() => navigate('/settings?tab=team-scheduling')}
            >
              Configure
            </Button>
          }
        />
        <CardSource
          title='LinkedIn Chrome extension'
          description='Prospect faster using our Chrome extension'
          icon={
            <Logo
              fill='none'
              name='linkedin-outline'
              className='text-grayModern-500'
            />
          }
          action={
            <Button
              size='xxs'
              variant='ghost'
              leftIcon={<Icon name='download-02' />}
              onClick={() =>
                window.open(
                  'https://chromewebstore.google.com/detail/khmdccjeodppdldkgifcnkndemjpfoml?utm_source=item-share-cb',
                )
              }
            >
              Install
            </Button>
          }
        />
        <CardSource
          title='API'
          icon={<Icon name='code-02' />}
          description='Use our API to import leads into your workspace'
          action={
            <Button
              size='xxs'
              variant='ghost'
              leftIcon={<Icon name='key-01' />}
              onClick={() => navigate('/settings?tab=api')}
            >
              Get key
            </Button>
          }
        />
        <CardSource
          title='Add manually'
          icon={<Icon name='user-plus-01' />}
          description='Add leads manually using their LinkedIn or email'
          action={
            <Button
              size='xxs'
              variant='ghost'
              onClick={handleAddLeads}
              leftIcon={<Icon name='plus' />}
            >
              Add leads
            </Button>
          }
        />
      </div>
    </div>
  );
});

interface CardSourceProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: React.ReactNode;
}

const CardSource = ({ icon, title, action, description }: CardSourceProps) => {
  return (
    <div className='w-full border border-grayModern-200 rounded-md p-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center justify-between gap-2 w-full'>
          <div className='flex items-center gap-2'>
            {icon}
            <h2 className='font-medium text-sm'>{title}</h2>
          </div>

          {action}
        </div>
      </div>
      <p className='text-sm ml-6 '>{description}</p>
    </div>
  );
};
