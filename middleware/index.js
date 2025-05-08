import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import bodyParser from 'body-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';

import 'dotenv/config';

const PUBLIC_PATHS = [
  '/google-auth',
  '/callback/google-auth',
  '/callback/google-auth-email-grant',
  '/callback/google-auth-calendar-grant',
  '/azure-ad-auth',
  '/magic-link-auth',
  '/validate-magic-code',
  '/callback/azure-ad-auth',
  '/callback/azure-ad-auth-email-grant',
];

const headersMiddleware = (req, res, next) => {
  res.removeHeader('Server');

  if (req.method === 'TRACE') {
    return res.status(403).send('TRACE method is not allowed');
  }

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight request if required
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    return res.sendStatus(200);
  }
  next();
};

const jwtMiddleware = (req, res, next) => {
  if (PUBLIC_PATHS.some((path) => req.path.startsWith(path))) {
    return next();
  }

  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    return res.status(400).json({
      message: 'missing authorization header',
    });
  }

  const sessionToken = authorizationHeader.split(' ')[1];

  if (!sessionToken) {
    return res.status(400).json({
      message: 'invalid token format',
    });
  }

  try {
    const session = jwt.verify(sessionToken, process.env.JWT_SECRET);

    req.session = session;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'invalid authorization token',
    });
  }
};

const googleOauthLoginClient = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  `${process.env.VITE_MIDDLEWARE_API_URL}/callback/google-auth`,
);

const googleOauthEmailClient = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  `${process.env.VITE_MIDDLEWARE_API_URL}/callback/google-auth-email-grant`,
);

const googleOauthCalendarClient = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  `${process.env.VITE_MIDDLEWARE_API_URL}/callback/google-auth-calendar-grant`,
);

async function customerOsSignIn(
  payload = {
    provider: {},
    tenant: '',
    loggedInEmail: '',
    oAuthTokenForEmail: '',
    oAuthToken: {},
  },
) {
  try {
    return fetch(`${process.env.CUSTOMER_OS_API_PATH}/signin`, {
      method: 'POST',
      headers: {
        'X-Openline-API-KEY': process.env.CUSTOMER_OS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(err);
  }
}

async function getCurrentUser(email, tenant) {
  return fetch(`${process.env.CUSTOMER_OS_API_PATH + '/query'}`, {
    method: 'POST',
    headers: {
      'X-Openline-API-KEY': process.env.CUSTOMER_OS_API_KEY,
      'X-Openline-USERNAME': email,
      'X-Openline-TENANT': tenant,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operationName: 'getCurrentUser',
      query: `
      query getCurrentUser {
        user_Current {
          id
          name
          profilePhotoUrl
        }
      }
      `,
    }),
  });
}

function fetchMagicLink(email) {
  return fetch(`${process.env.CUSTOMER_OS_API_PATH + '/rml'}`, {
    method: 'POST',
    headers: {
      'X-Openline-API-KEY': process.env.CUSTOMER_OS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
    }),
  });
}

function verifyMagicLink(code) {
  return fetch(`${process.env.CUSTOMER_OS_API_PATH + '/pml'}`, {
    method: 'POST',
    headers: {
      'X-Openline-API-KEY': process.env.CUSTOMER_OS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
    }),
  });
}

function getMicrosoftAccessToken(code, scope, redirect_uri) {
  const url = new URL(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  );

  const params = new URLSearchParams({
    client_id: process.env.AZURE_AD_CLIENT_ID,
    scope: scope,
    code,
    redirect_uri,
    grant_type: 'authorization_code',
    client_secret: process.env.AZURE_AD_CLIENT_SECRET,
  }).toString();

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
}

function fetchMicrosoftProfile(token) {
  return fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function createIntegrationAppToken(tenant) {
  const WORKSPACE_KEY = process.env.INTEGRATION_APP_WORKSPACE_KEY;
  const PRIVATE_KEY_VALUE = process.env.INTEGRATION_APP_PRIVATE_KEY_VALUE;

  const tokenData = {
    id: tenant,
    name: tenant,
  };

  const token = jwt.sign(tokenData, PRIVATE_KEY_VALUE, {
    issuer: WORKSPACE_KEY,
    expiresIn: '30d',
    algorithm: 'ES256',
  });

  return token;
}

async function createServer() {
  const app = express();

  app.use(cors());
  app.use(headersMiddleware);
  app.use(helmet());
  app.use(jwtMiddleware);

  const customerOsApiGqlProxy = createProxyMiddleware({
    pathFilter: '/customer-os-api',
    pathRewrite: { '^/customer-os-api': '' },
    target: process.env.CUSTOMER_OS_API_PATH + '/query',
    changeOrigin: true,
    headers: {
      'X-Openline-API-KEY': process.env.CUSTOMER_OS_API_KEY,
    },
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const mailstackApiGqlProxy = createProxyMiddleware({
    pathFilter: '/mailstack',
    pathRewrite: { '^/mailstack': '' },
    target: process.env.MAILSTACK_API_PATH + '/query',
    changeOrigin: true,
    headers: {
      'X-CUSTOMER-OS-API-KEY': process.env.MAILSTACK_API_KEY,
    },
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const customerOsApiRestProxy = createProxyMiddleware({
    pathFilter: '/cos',
    pathRewrite: { '^/cos': '' },
    target: process.env.CUSTOMER_OS_API_PATH,
    changeOrigin: true,
    headers: {
      'X-Openline-API-KEY': process.env.CUSTOMER_OS_API_KEY,
    },
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const customerOsApiRestProxyForTenant = createProxyMiddleware({
    pathFilter: '/tenant-cos-api',
    pathRewrite: { '^/tenant-cos-api': '' },
    target: process.env.CUSTOMER_OS_API_PATH,
    changeOrigin: true,
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const realtimeApiProxy = createProxyMiddleware({
    pathFilter: '/realtime',
    pathRewrite: { '^/realtime': '' },
    target: process.env.REALTIME_API_PATH + '/graphql',
    headers: {
      'X-Openline-API-KEY': process.env.REALTIME_API_KEY,
    },
    changeOrigin: true,
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const internalApiProxy = createProxyMiddleware({
    pathFilter: '/internal',
    pathRewrite: { '^/internal': '' },
    target: process.env.INTERNAL_API_PATH,
    changeOrigin: true,
    headers: {
      'X-Openline-API-KEY': process.env.INTERNAL_API_KEY,
    },
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const filesApiProxy = createProxyMiddleware({
    pathFilter: '/files',
    pathRewrite: { '^/files': '' },
    target: process.env.CUSTOMER_OS_API_PATH + '/files/v1/files',
    changeOrigin: true,
    headers: {
      'X-Openline-API-KEY': process.env.INTERNAL_API_KEY,
    },
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const filesApiProxyForTenant = createProxyMiddleware({
    pathFilter: '/workspace-logo',
    pathRewrite: { '^/workspace-logo': '' },
    target: process.env.CUSTOMER_OS_API_PATH + '/files/v1/workspace-logo',
    changeOrigin: true,
    headers: {
      'X-Openline-API-KEY': process.env.INTERNAL_API_KEY,
    },
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const invoiceProxy = createProxyMiddleware({
    pathFilter: '/invoices',
    pathRewrite: { '^/invoices': '' },
    target: process.env.CUSTOMER_OS_API_PATH + '/billing/v1/invoices',
    headers: {
      'X-Openline-API-KEY': process.env.CUSTOMER_OS_API_KEY,
    },
    changeOrigin: true,
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const basConfigProxy = createProxyMiddleware({
    pathFilter: '/bas',
    pathRewrite: { '^/bas': '' },
    target: process.env.BAS_CONFIG_PATH,
    changeOrigin: true,
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  const leadsApiProxy = createProxyMiddleware({
    pathFilter: '/leads',
    pathRewrite: { '^/leads': '' },
    target: process.env.LEADS_API_PATH + '/query',
    changeOrigin: true,
    headers: {
      'X-Openline-API-KEY': process.env.LEADS_API_KEY,
    },
    logger: console,
    preserveHeaderKeyCase: true,
    followRedirects: true,
  });

  app.use(mailstackApiGqlProxy);
  app.use(customerOsApiGqlProxy);
  app.use(customerOsApiRestProxy);
  app.use(customerOsApiRestProxyForTenant);
  app.use(internalApiProxy);
  app.use(filesApiProxy);
  app.use(filesApiProxyForTenant);
  app.use(basConfigProxy);
  app.use(realtimeApiProxy);
  app.use(invoiceProxy);
  app.use(leadsApiProxy);
  //login button
  app.use('/google-auth', (req, res) => {
    const scopes = ['openid', 'email', 'profile'];

    const url = googleOauthLoginClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: btoa(
        JSON.stringify({
          origin: req?.query?.from ?? '/finder',
        }),
      ),
    });

    res.json({ url });
  });
  app.use('/azure-ad-auth', (req, res) => {
    const scopes = [
      'email',
      'openid',
      'profile',
      'offline_access',
      'User.Read',
    ];
    const scope = scopes.join(' ');
    const url = new URL(
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    );

    url.searchParams.append('client_id', process.env.AZURE_AD_CLIENT_ID);
    url.searchParams.append('scope', scope);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append(
      'redirect_uri',
      `${process.env.VITE_MIDDLEWARE_API_URL}/callback/azure-ad-auth`,
    );
    url.searchParams.append('sso_reload', 'true');
    url.searchParams.append('prompt', 'consent');
    url.searchParams.append(
      'state',
      btoa(
        JSON.stringify({
          origin: req?.query?.from ?? '/finder',
          scope,
        }),
      ),
    );

    res.json({ url: url.toString() });
  });
  app.post('/magic-link-auth', bodyParser.json(), async (req, res) => {
    const body = req.body;

    try {
      await fetchMagicLink(body.email);

      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/validate-magic-code', bodyParser.json(), async (req, res) => {
    const body = req.body;

    try {
      const magicLinkReq = await verifyMagicLink(body.code);
      const magicLinkRes = await magicLinkReq.json();

      if (!magicLinkRes?.currentTenant) {
        throw new Error(magicLinkRes?.result);
      }

      const integrations_token = createIntegrationAppToken(
        magicLinkRes?.currentTenant,
      );

      const sessionToken = jwt.sign(
        {
          tenant: magicLinkRes?.currentTenant,
          defaultTenant: magicLinkRes?.defaultTenant,
          access_token: '',
          refresh_token: '',
          integrations_token,
          profile: {
            id: magicLinkRes?.userId,
            email: magicLinkRes?.email,
          },
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        },
      );

      res.json({
        sessionToken,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json(err.message);
    }
  });

  //add email account for email syncing
  app.use('/enable/google-sync', async (req, res) => {
    const scopes = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://mail.google.com/',
    ];

    const url = googleOauthEmailClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: btoa(
        JSON.stringify({
          tenant: req.session.tenant,
          origin: req.query.origin,
          type: req.query.type,
          email: req.session.profile.email,
        }),
      ),
    });

    res.json({ url });
  });

  app.get('/enable/google-calendar-sync', async (req, res) => {
    try {
      const scopes = [
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar',
      ];

      const url = googleOauthCalendarClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: btoa(
          JSON.stringify({
            tenant: req.session.tenant,
            origin: req.query.origin,
            type: 'calendar',
            email: req.session.profile.email,
            timeZone: req.query.timeZone,
          }),
        ),
      });

      return res.json({ url });
    } catch (error) {
      console.error('OAuth URL generation error:', error);

      return res.status(500).json({ message: 'Failed to generate OAuth URL' });
    }
  });

  app.use('/enable/azure-ad-sync', (req, res) => {
    const scopes = [
      'email',
      'openid',
      'User.Read',
      'profile',
      'offline_access',
      'Mail.ReadWrite',
      'Mail.Read',
      'Mail.Send',
    ];
    const scope = scopes.join(' ');
    const url = new URL(
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    );

    url.searchParams.append('client_id', process.env.AZURE_AD_CLIENT_ID);
    url.searchParams.append('scope', scope);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append(
      'redirect_uri',
      `${process.env.VITE_MIDDLEWARE_API_URL}/callback/azure-ad-auth-email-grant`,
    );
    url.searchParams.append('sso_reload', 'true');
    url.searchParams.append('prompt', 'consent');
    url.searchParams.append(
      'state',
      btoa(
        JSON.stringify({
          tenant: req.session.tenant,
          origin: req.query.origin,
          type: req.query.type,
          email: req.session.profile.email,
          scope,
        }),
      ),
    );

    res.json({ url: url.toString() });
  });

  //login callback
  app.use('/callback/google-auth', async (req, res) => {
    const { code, state } = req.query;
    const stateParsed = JSON.parse(atob(state));

    try {
      const { tokens } = await googleOauthLoginClient.getToken(code);

      googleOauthLoginClient.setCredentials(tokens);

      const { access_token, refresh_token, expiry_date, scope } = tokens;

      const profileRes = await google
        .oauth2({
          auth: googleOauthLoginClient,
          version: 'v2',
        })
        .userinfo.get();

      const loggedInEmail = stateParsed?.email ?? profileRes.data.email;

      const currentUserReq = await getCurrentUser(
        loggedInEmail,
        stateParsed?.tenant ?? '',
      );

      const currentUserRes = await currentUserReq.json();

      const loginResponsePromise = await customerOsSignIn({
        tenant: stateParsed?.tenant ?? '',
        loggedInEmail: loggedInEmail,
        provider: 'google',
        oAuthTokenForEmail: profileRes.data.email,
        oAuthTokenType: stateParsed?.type ?? '',
        oAuthToken: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: expiry_date
            ? new Date(expiry_date).toISOString()
            : new Date().toISOString(),
          scope,
          providerAccountId: profileRes.data.id,
          idToken: tokens.id_token,
        },
      });

      const loginResponse = await loginResponsePromise.json();

      if (loginResponsePromise.status === 400) {
        res.redirect(
          `${process.env.VITE_CLIENT_APP_URL}/auth/failure?message=${loginResponse.code}`,
        );

        return;
      }

      const integrations_token = createIntegrationAppToken(
        loginResponse.currentTenant,
      );

      const campaign =
        new URLSearchParams(stateParsed?.origin).get('campaign') ?? '';

      const sessionToken = jwt.sign(
        {
          tenant: loginResponse.currentTenant,
          tenantApiKey: loginResponse.apiKey,
          defaultTenant: loginResponse.defaultTenant,
          campaign,
          access_token,
          refresh_token,
          integrations_token,
          profile: {
            ...profileRes.data,
            id: currentUserRes.data.user_Current.id,
            name: currentUserRes.data.user_Current.name,
            profilePhotoUrl: currentUserRes.data.user_Current.profilePhotoUrl,
          },
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        },
      );

      const redirectURL = `${
        process.env.VITE_CLIENT_APP_URL
      }/auth/success?sessionToken=${sessionToken}&origin=${encodeURIComponent(
        stateParsed.origin,
      )}`;

      res.redirect(redirectURL);
    } catch (err) {
      console.error(err);
      res.redirect(
        `${process.env.VITE_CLIENT_APP_URL}/auth/failure?message=${err.message}`,
      );
    }
  });
  app.use('/callback/azure-ad-auth', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
      console.error('azure-ad-login-error', error);

      var error_description = '';

      if (error === 'access_denied') {
        error_description =
          'You have canceled the login process. Please try again.';
      } else if (error === 'consent_required') {
        error_description =
          'You have declined the consent. The consent is required to proceed. Please try again.';
      }

      res.redirect(
        `${process.env.VITE_CLIENT_APP_URL}/auth/failure?message=${error_description}`,
      );

      return;
    }

    const stateParsed = JSON.parse(atob(state));

    try {
      const tokenReq = await getMicrosoftAccessToken(
        code,
        stateParsed.scope,
        `${process.env.VITE_MIDDLEWARE_API_URL}/callback/azure-ad-auth`,
      );

      const tokenRes = await tokenReq.json();

      const { id_token, access_token, refresh_token, scope } = tokenRes;

      console.error('tokenRes', tokenRes);

      const profileReq = await fetchMicrosoftProfile(access_token);
      const profileRes = await profileReq.json();

      console.error('profileRes', profileRes);

      const loggedInEmail = stateParsed?.email ?? profileRes?.userPrincipalName;

      const loginResponsePromise = await customerOsSignIn({
        tenant: stateParsed?.tenant ?? '',
        loggedInEmail: loggedInEmail,
        provider: 'azure-ad',
        oAuthTokenType: stateParsed?.type ?? '',
        oAuthTokenForEmail: profileRes?.userPrincipalName,
        oAuthToken: {
          idToken: id_token,
          accessToken: access_token,
          refreshToken: refresh_token,
          scope,
          providerAccountId: profileRes.id,
        },
      });
      const loginResponse = await loginResponsePromise.json();

      const integrations_token = createIntegrationAppToken(
        loginResponse.currentTenant,
      );
      const currentUserReq = await getCurrentUser(
        loggedInEmail,
        stateParsed?.tenant ?? '',
      );
      const currentUserRes = await currentUserReq.json();

      const campaign =
        new URLSearchParams(stateParsed?.origin).get('campaign') ?? '';

      const profile = {
        id: currentUserRes.data.user_Current.id,
        name: profileRes?.displayName ?? '',
        email: loggedInEmail,
        locale: '',
        picture: '',
        given_name: profileRes?.givenName ?? '',
        verified_email: false,
      };

      const sessionToken = jwt.sign(
        {
          tenant: loginResponse.currentTenant,
          defaultTenant: loginResponse.defaultTenant,
          campaign,
          access_token,
          refresh_token,
          integrations_token,
          profile,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        },
      );

      const redirectURL = `${
        process.env.VITE_CLIENT_APP_URL
      }/auth/success?sessionToken=${sessionToken}&origin=${encodeURIComponent(
        stateParsed.origin,
      )}`;

      res.redirect(redirectURL);
    } catch (err) {
      console.error(err);
      res.redirect(
        `${process.env.VITE_CLIENT_APP_URL}/auth/failure?message=${err.message}`,
      );
    }
  });

  //add email account callback
  app.use('/callback/google-auth-email-grant', async (req, res) => {
    const { code, state } = req.query;
    const stateParsed = JSON.parse(atob(state));

    try {
      const { tokens } = await googleOauthEmailClient.getToken(code);

      googleOauthEmailClient.setCredentials(tokens);

      const { access_token, refresh_token, expiry_date, scope } = tokens;

      const profileRes = await google
        .oauth2({
          auth: googleOauthEmailClient,
          version: 'v2',
        })
        .userinfo.get();

      const loggedInEmail = stateParsed?.email ?? profileRes.data.email;

      const loginResponsePromise = await customerOsSignIn({
        tenant: stateParsed?.tenant ?? '',
        loggedInEmail: loggedInEmail,
        provider: 'google',
        oAuthTokenForEmail: profileRes.data.email,
        oAuthTokenType: stateParsed?.type ?? '',
        oAuthToken: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: expiry_date
            ? new Date(expiry_date).toISOString()
            : new Date().toISOString(),
          scope,
          providerAccountId: profileRes.data.id,
          idToken: tokens.id_token,
        },
      });

      await loginResponsePromise.json();

      var redirectUrl = process.env.VITE_CLIENT_APP_URL + stateParsed.origin;

      // Check if the origin already has the email parameter
      const emailParamRegex = /[?&]email=([^&]*)/;
      const emailParamMatch = stateParsed.origin.match(emailParamRegex);

      if (emailParamMatch) {
        // Replace existing email parameter with the new value
        redirectUrl = redirectUrl.replace(emailParamRegex, (match, p1) => {
          return match.replace(p1, profileRes.data.email);
        });
      } else {
        // Add the email parameter
        redirectUrl +=
          (stateParsed.origin.includes('?') ? '&' : '?') +
          'email=' +
          profileRes.data.email;
      }
      redirectUrl += '&provider=google';

      res.redirect(redirectUrl);
    } catch (err) {
      console.error(err);
      res.redirect(
        `${process.env.VITE_CLIENT_APP_URL}/auth/failure?message=${err.message}`,
      );
    }
  });
  app.use('/callback/azure-ad-auth-email-grant', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
      console.error('azure-ad-login-error', error);

      var error_description = '';

      if (error === 'access_denied') {
        error_description =
          'You have canceled the login process. Please try again.';
      } else if (error === 'consent_required') {
        error_description =
          'You have declined the consent. The consent is required to proceed. Please try again.';
      }

      res.redirect(
        `${process.env.VITE_CLIENT_APP_URL}/auth/failure?message=${error_description}`,
      );

      return;
    }

    const stateParsed = JSON.parse(atob(state));

    try {
      const tokenReq = await getMicrosoftAccessToken(
        code,
        stateParsed.scope,
        `${process.env.VITE_MIDDLEWARE_API_URL}/callback/azure-ad-auth-email-grant`,
      );

      const tokenRes = await tokenReq.json();

      const { id_token, access_token, refresh_token, scope } = tokenRes;

      console.error('tokenRes', tokenRes);

      const profileReq = await fetchMicrosoftProfile(access_token);
      const profileRes = await profileReq.json();

      console.error('profileRes', profileRes);

      const loggedInEmail = stateParsed?.mail ?? profileRes?.userPrincipalName;

      await customerOsSignIn({
        tenant: stateParsed?.tenant ?? '',
        loggedInEmail: loggedInEmail,
        provider: 'azure-ad',
        oAuthTokenType: stateParsed?.type ?? '',
        oAuthTokenForEmail: profileRes?.userPrincipalName,
        oAuthToken: {
          idToken: id_token,
          accessToken: access_token,
          refreshToken: refresh_token,
          scope,
          providerAccountId: profileRes.id,
        },
      });

      var redirectUrl = process.env.VITE_CLIENT_APP_URL + stateParsed.origin;

      // Check if the origin already has the email parameter
      const emailParamRegex = /[?&]email=([^&]*)/;
      const emailParamMatch = stateParsed.origin.match(emailParamRegex);

      if (emailParamMatch) {
        // Replace existing email parameter with the new value
        redirectUrl = redirectUrl.replace(emailParamRegex, (match, p1) => {
          return match.replace(p1, profileRes.mail);
        });
      } else {
        // Add the email parameter
        redirectUrl +=
          (stateParsed.origin.includes('?') ? '&' : '?') +
          'email=' +
          profileRes.mail;
      }
      redirectUrl += '&provider=azure-ad';

      res.redirect(redirectUrl);
    } catch (err) {
      console.error(err);
      res.redirect(
        `${process.env.VITE_CLIENT_APP_URL}/auth/failure?message=${err.message}`,
      );
    }
  });

  app.use('/callback/google-auth-calendar-grant', async (req, res) => {
    const { code, state } = req.query;

    const stateParsed = JSON.parse(atob(state));

    try {
      const { tokens } = await googleOauthCalendarClient.getToken(code);

      googleOauthLoginClient.setCredentials(tokens);

      const { refresh_token } = tokens;

      const profileRes = await google
        .oauth2({
          auth: googleOauthLoginClient,
          version: 'v2',
        })
        .userinfo.get();

      const loggedInEmail = profileRes.data.email;

      const resp = await fetch(
        `${process.env.CUSTOMER_OS_API_PATH + '/query'}`,
        {
          method: 'POST',
          headers: {
            'X-Openline-API-KEY': process.env.CUSTOMER_OS_API_KEY,
            'X-Openline-USERNAME': loggedInEmail,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operationName: 'nylasConnect',
            query: `
        mutation nylasConnect {
          nylasConnect(input: {
            timezone: "${stateParsed.timeZone}",
            email: "${loggedInEmail}",
            refreshToken: "${refresh_token}",
            provider: NYLAS_PROVIDER_GOOGLE,
          }){
            email
            }
        }`,
          }),
        },
      );

      if (!resp.ok) {
        console.error('Failed to connect to Nylas', resp);
        throw new Error('Failed to connect to Nylas');
      }

      const result = await resp.json();

      if (result.errors) {
        throw new Error(result.errors.map((error) => error.message).join(', '));
      }

      const redirectURL = `${
        process.env.VITE_CLIENT_APP_URL
      }/auth/success?&origin=${encodeURIComponent('/settings?tab=calendar')}`;

      res.redirect(redirectURL);
    } catch (err) {
      console.error('Calendar callback error:', err);

      return res.redirect(
        `${
          process.env.VITE_CLIENT_APP_URL
        }/auth/failure?message=${encodeURIComponent(err.message)}`,
      );
    }
  });

  app.use('/session', (req, res) => {
    res.json({ session: req?.session ?? null });
  });

  app.use('/switchWorkspace', async (req, res) => {
    const resp = await fetch(`${process.env.CUSTOMER_OS_API_PATH + '/query'}`, {
      method: 'POST',
      headers: {
        'X-Openline-API-KEY': process.env.CUSTOMER_OS_API_KEY,
        'X-Openline-USERNAME': req.session.profile.email,
        'X-Openline-TENANT': req.session.tenant,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'admin_switchCurrentWorkspace',
        query: `
      mutation admin_switchCurrentWorkspace {
        admin_switchCurrentWorkspace(switchToTenant: "${req.query.tenant}")
      }`,
      }),
    });

    const currentUserReq = await getCurrentUser(
      req.session.profile.email,
      req.query.tenant,
    );

    const currentUserRes = await currentUserReq.json();

    const switchTenantResponse = await resp.json();

    if (resp.status !== 200) {
      return res.json({
        redirectUrl: `${process.env.VITE_CLIENT_APP_URL}/auth/failure?message=${switchTenantResponse.message}`,
      });
    }

    const integrations_token = createIntegrationAppToken(req.query.tenant);

    const newSessionToken = jwt.sign(
      {
        tenant: req.query.tenant,
        defaultTenant: req.session.defaultTenant,
        campaign: req.session.campaign,
        access_token: req.session.access_token,
        refresh_token: req.session.refresh_token,
        integrations_token: integrations_token, //TODO we need to fetch a new integration app token for this tenant
        profile: {
          ...req.session.profile,
          id: currentUserRes.data.user_Current.id,
          name: currentUserRes.data.user_Current.name,
          profilePhotoUrl: currentUserRes.data.user_Current.profilePhotoUrl,
        },
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      },
    );

    const redirectURL = `${process.env.VITE_CLIENT_APP_URL}/auth/success?sessionToken=${newSessionToken}`;

    res.json({ redirectUrl: redirectURL });
  });

  app.listen(5174);
  console.info('Middleware server started on port 5174');
}

createServer();
