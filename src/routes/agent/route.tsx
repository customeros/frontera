import { RouteObject } from 'react-router-dom';

import { AgentPage } from './page';
import { AgentsSubRoutes } from './routes';

export const AgentRoute: RouteObject = {
  path: '/agents/:id/*',
  element: <AgentPage />,
  children: [
    {
      path: '*',
      element: <AgentsSubRoutes />,
    },
  ],
};
