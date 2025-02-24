import { useRef } from 'react';
import { Link } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';

import { useStore } from '@shared/hooks/useStore';
import { TableCellTooltip } from '@ui/presentation/Table';

interface OrganizationCellProps {
  id: string;
}

export const OrganizationCell = observer(({ id }: OrganizationCellProps) => {
  const store = useStore();
  const orgName = store.organizations.getById(id)?.value?.name;
  const [tabs] = useLocalStorage<{
    [key: string]: string;
  }>(`customeros-player-last-position`, { root: 'finder' });
  const linkRef = useRef<HTMLAnchorElement>(null);

  const lastPositionParams = tabs[id];
  const href = getHref(id, lastPositionParams);

  return (
    <TableCellTooltip
      hasArrow
      align='start'
      side='bottom'
      label={orgName}
      targetRef={linkRef}
    >
      <span className='inline'>
        <Link
          to={href}
          ref={linkRef}
          className='inline text-grayModern-700 no-underline hover:no-underline font-normal'
        >
          {orgName}
        </Link>
      </span>
    </TableCellTooltip>
  );
});

function getHref(id: string, lastPositionParams: string | undefined) {
  return `/organization/${id}?${lastPositionParams || 'tab=people'}`;
}
