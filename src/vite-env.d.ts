/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
interface ImportMetaEnv {
  readonly VITE_TEST_TENANT: string;
  readonly VITE_TEST_API_URL: string;
  readonly VITE_TEST_API_KEY: string;
  readonly VITE_TEST_USERNAME: string;
  readonly VITE_CLIENT_APP_URL: string;
  readonly VITE_REALTIME_WS_PATH: string;
  readonly VITE_REALTIME_API_URL: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_MIDDLEWARE_API_URL: string;
  readonly VITE_REALTIME_WS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
