import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';
import { registry } from '@/domain/stores/registry';

import { Eye } from '@ui/media/icons/Eye';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';

interface OrganizationCellProps {
  id: string;
}

export const OrganizationCell = observer(({ id }: OrganizationCellProps) => {
  const store = useStore();
  const organizationStore = registry.get('organizations');
  const org = organizationStore.get(id);

  const name = org?.name;
  const isEnriching = org?.isEnriching;

  const [tabs] = useLocalStorage<{
    [key: string]: string;
  }>(`customeros-player-last-position`, { root: 'finder' });
  const navigate = useNavigate();

  const fullName = name || 'Unnamed';

  const handleNavigate = () => {
    const lastPositionParams = tabs[id];
    const href = getHref(id, lastPositionParams);

    if (!href) return;

    navigate(href);
  };

  if (isEnriching) {
    return <p className='text-grayModern-400'>Enriching...</p>;
  }

  if (!org) return <p className='text-grayModern-400'>Not set</p>;

  return (
    <div className='flex items-center gap-2 group/orgName w-full'>
      <span
        onClick={handleNavigate}
        data-test='organization-name-in-all-orgs-table'
        className='overflow-ellipsis overflow-hidden font-medium no-underline hover:no-underline cursor-pointer'
      >
        {fullName}
      </span>
      <IconButton
        size='xs'
        variant='ghost'
        aria-label='preview company'
        icon={<Eye className='text-grayModern-500' />}
        className='hidden group-hover/orgName:flex cursor-pointer'
        onClick={() => {
          if (store.ui.showPreviewCard && store.ui.focusRow === id) {
            store.ui.setShowPreviewCard(false);
          } else {
            store.ui.setFocusRow(id);
            store.ui.setShowPreviewCard(true);
            store.ui.setShowLeadSources(false);
          }
        }}
      />
    </div>
  );
});

function getHref(id: string, lastPositionParams: string | undefined) {
  return `/organization/${id}?${lastPositionParams || 'tab=about'}`;
}
