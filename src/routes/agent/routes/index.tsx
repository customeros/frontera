import { Route, Routes, Navigate, useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { AgentType } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';
import { ProtectedRoute } from '@shared/components/ProtectedRoute';

import { ConfigPage } from '../components/AgentConfig';

export const AgentsSubRoutes = observer(() => {
  const { id } = useParams<{ id: string }>();
  const store = useStore();

  const agent = id ? store.agents.getById(id) : null;

  return (
    <Routes>
      <Route path='setup' element={<ConfigPage />} />
      <Route
        path='editor'
        element={
          <ProtectedRoute
            fallback={'../setup'}
            condition={agent?.value.type === AgentType.CampaignManager}
          >
            {/*  TODO - add Editor here */}
            <div />
          </ProtectedRoute>
        }
      />
      <Route
        path='list'
        element={
          <ProtectedRoute
            fallback={'../setup'}
            condition={agent?.value.type === AgentType.CampaignManager}
          >
            {/*  TODO - add list here */}
            <div />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<Navigate replace to='setup' />} />
    </Routes>
  );
});
