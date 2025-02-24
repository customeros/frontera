import { useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { match } from 'ts-pattern';
import { CommonService } from '@domain/services/common/common.service';

import { useStore } from '@shared/hooks/useStore';

/*
 * This hook is used to handle 3rd party oauth callbacks
 * and redirect to the agent page if the agent id is present.
 * Some usecases initiate a 3rd party integration connection if none is present
 * and redirect back to the /agents route with the agent id, capability id and a code.
 * The code is then used to authenticate the 3rd party integration.
 *
 * This hook handles the redirect back to the app from the 3rd party integration.
 *
 * usecase files that initiate the 3rd party integration connection:
 * - add-slack-channel.usecase
 * - add-quickbooks-account.usecase
 */
export const useOauthCallback = () => {
  const store = useStore();
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();

  const commonService = useMemo(() => new CommonService(), []);

  useEffect(() => {
    const state = queryParams.get('state');
    const code = queryParams.get('code');
    const [source, id, cid] = decodeURIComponent(state ?? '').split(':');

    if (!store.session?.isAuthenticated) return;

    if (code) {
      match(source)
        .with('slack', () => {
          store.settings.slack.oauthCallback(
            code,
            `${import.meta.env.VITE_CLIENT_APP_URL}/agents`,
          );
        })
        .with('quickbooks', async () => {
          const realmId = queryParams.get('realmId');

          if (!realmId) {
            console.error('No realmId found in query params');

            return;
          }

          return commonService.quickbooksOauthCallback(
            code,
            realmId,
            `${import.meta.env.VITE_CLIENT_APP_URL}/agents`,
          );
        })
        .otherwise(() => {});
    }

    if (id) {
      navigate(`/agents/${id}/setup?${cid}`, { replace: true });
    }
  }, [store.session?.isAuthenticated]);
};
