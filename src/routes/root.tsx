import { RouteObject } from 'react-router-dom';

import { NylasScheduling, NylasSchedulerEditor } from '@nylas/react';

import { Layout } from '@shared/components/Layout/Layout';

import { AuthRoute } from './auth/route';
import { AgentRoute } from './agent/route';
import { AgentsRoute } from './agents/route';
import { FinderRoute } from './finder/route';
import { Error } from './src/components/Error';
import { SettingsRoute } from './settings/route';
import { ProspectsRoute } from './prospects/route';
import { NotFound } from './src/components/NotFound';
import { OnboardingRoute } from './onboarding/route';
import { FlowEditorRoute } from './flow-editor/route';
import { CustomerMapRoute } from './customer-map/route';
import { OrganizationRoute } from './organization/route';

const Test = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const configId = urlParams.get('config_id') || '';

  return (
    <div>
      <NylasScheduling
        configurationId={configId}
        schedulerApiUrl='https://api.eu.nylas.com'
      />
    </div>
  );
};
const NotFoundRoute: RouteObject = {
  path: '*',
  element: <NotFound />,
};

export const RootRoute: RouteObject = {
  path: '/',
  element: <Layout />,
  children: [
    {
      path: '/scheduler-editor',
      element: (
        <div>
          <NylasSchedulerEditor
            className='min-h-full w-full'
            schedulerPreviewLink={`${window.location.origin}/book?config_id={config.id}`}
            nylasSessionsConfig={{
              clientId: '6ff9c91b-3b9d-4980-ace1-949313d0a475', // Replace with your Nylas client ID from the previous
              redirectUri: `https://app.customeros.ai/scheduler-editor`,
              domain: 'https://api.eu.nylas.com/v3', // or 'https://api.eu.nylas.com/v3' for EU data center
              hosted: false,
              accessType: 'offline',
            }}
            defaultSchedulerConfigState={{
              selectedConfiguration: {
                requires_session_auth: false, // Creates a public configuration which doesn't require a session
                scheduler: {
                  // The callback URLs to be set in email notifications
                  rescheduling_url: `${window.location.origin}/reschedule/:booking_ref`, // The URL of the email notification includes the booking reference
                  cancellation_url: `${window.location.origin}/cancel/:booking_ref`,
                },
              },
            }}
          />
        </div>
      ),
    },
    {
      path: '/book',
      element: (
        <div>
          <a className='button' href='/scheduler-editor'>
            View Scheduler Editor
          </a>
          <Test />
        </div>
      ),
    },

    AuthRoute,
    AgentRoute,
    AgentsRoute,
    SettingsRoute,
    OrganizationRoute,
    FinderRoute,
    CustomerMapRoute,
    ProspectsRoute,
    FlowEditorRoute,
    OnboardingRoute,
    NotFoundRoute,
  ],
  errorElement: <Error />,
};
