import { Team } from './panels/Workspace/Team';
import { Profile } from './panels/Personal/Profile';
import { General } from './panels/Workspace/General';
// import { BillingPanel } from './panels/BillingPanel';
import { Products } from './panels/Workspace/Products';
import { Mailboxes } from './panels/Personal/Mailboxes';
import { ApiManager } from './panels/Workspace/ApiManager';
import { TagsManager } from './panels/Workspace/TagsManager';
// import { IntegrationsPanel } from './panels/IntegrationsPanel';
import { OrganizationFields } from './panels/Fields/Organizations';

interface PanelsProps {
  tab: string;
}

export const Panels = ({ tab }: PanelsProps) => {
  switch (tab) {
    case 'auth':
    // case 'billing':
    //   return <BillingPanel />;
    // case 'integrations':
    //   return <IntegrationsPanel />;
    case 'general':
      return <General />;
    case 'tags':
      return <TagsManager />;
    case 'api':
      return <ApiManager />;
    case 'organizations':
      return <OrganizationFields />;
    // case 'contacts':
    //   return <ContactFields />;
    case 'mailboxes':
      return <Mailboxes />;
    case 'products':
      return <Products />;
    case 'profile':
      return <Profile />;
    case 'team':
      return <Team />;

    default:
      return <Mailboxes />;
  }
};
