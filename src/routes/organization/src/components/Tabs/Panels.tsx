import { useParams } from 'react-router-dom';

import { OrganizationDetails } from '@shared/components/OrganizationDetails';

import { PeoplePanel } from './panels/PeoplePanel';
import { AccountPanel } from './panels/AccountPanel';
import { InvoicesPanel } from './panels/InvoicesPanel';

interface PanelsProps {
  tab: string;
}

export const Panels = ({ tab }: PanelsProps) => {
  const { id } = useParams<{ id: string }>();

  switch (tab) {
    case 'account':
      return <AccountPanel />;
    case 'people':
      return <PeoplePanel />;
    case 'invoices':
      return <InvoicesPanel />;
    default:
      return id ? <OrganizationDetails id={id} /> : null;
  }
};
