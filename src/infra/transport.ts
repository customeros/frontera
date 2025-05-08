import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

import { Socket, Channel } from 'phoenix';
import axios, { AxiosInstance } from 'axios';
import {
  Variables,
  GraphQLClient,
  RequestDocument,
  resolveRequestDocument,
} from 'graphql-request';

import { LatestDiff } from './types';

type ApiRealm = 'core' | 'realtime' | 'mailstack' | 'leads';

const isTestMode = import.meta.env.MODE === 'test';
const defaultGraphqlHeaders: Record<string, string> = isTestMode
  ? {
      'X-OPENLINE-API-KEY': import.meta.env.VITE_TEST_API_KEY as string,
      'X-OPENLINE-TENANT': import.meta.env.VITE_TEST_TENANT as string,
      'X-OPENLINE-USERNAME': import.meta.env.VITE_TEST_USERNAME as string,
    }
  : {};

export class Transport {
  http: AxiosInstance;
  graphql: TracedGraphQLClient;
  socket: Socket | null = null;
  refId: string = crypto.randomUUID();
  channels: Map<string, Channel> = new Map();
  channelMeta: Record<string, unknown> = {};
  stream: ReturnType<typeof createStreamClient>;
  static instances: Map<ApiRealm, Transport> = new Map();
  private realm: ApiRealm;

  static getInstance(realm: ApiRealm = 'core') {
    if (!Transport.instances.has(realm)) {
      Transport.instances.set(realm, new Transport(realm));
    }

    return Transport.instances.get(realm)!;
  }

  constructor(realm: ApiRealm = 'core') {
    this.realm = realm;
    this.http = createHttpClient({});
    this.stream = createStreamClient({});
    this.graphql = createGraphqlClient(realm, defaultGraphqlHeaders);

    this.socket = new Socket(
      `${import.meta.env.VITE_REALTIME_WS_PATH}/socket`,
      {
        params: { token: import.meta.env.VITE_REALTIME_WS_API_KEY },
      },
    );

    if (this.socket.isConnected()) return;
    this.connect();
  }

  connect() {
    this?.socket?.connect();
  }

  join(
    channelName: string,
    id: string,
    version: number,
    group?: boolean,
  ): Promise<void | { channel: Channel; latest: LatestDiff | null }> {
    return new Promise((resolve, reject) => {
      const channelKey = group ? channelName : id;
      const existingChannel = this.channels.get(channelKey);

      if (existingChannel) {
        resolve({ channel: existingChannel, latest: null });

        return;
      }

      const channel = this?.socket?.channel(`${channelName}:${id}`, {
        ...this.channelMeta,
        version,
      });

      if (!channel) {
        reject(new Error('Channel not found'));

        return;
      }

      channel
        .join()
        .receive('ok', (res: LatestDiff) => {
          this.channels.set(channelKey, channel);
          resolve({ latest: res, channel });
        })
        .receive('error', () => {
          reject(new Error('Error joining channel'));
        });
    });
  }

  leaveChannel(id: string) {
    const channel = this.channels.get(id);

    if (!channel) {
      return;
    }

    channel.leave();
    this.channels.delete(id);
  }

  disconnect() {
    this.channels.forEach((channel) => {
      channel.leave();
    });
    this?.socket?.disconnect();
  }

  setChannelMeta(meta: Record<string, unknown>) {
    this.channelMeta = meta;
  }

  setHeaders(headers: Record<string, string>) {
    this.http = createHttpClient(headers);
    this.stream = createStreamClient(headers);
    this.graphql = createGraphqlClient(this.realm, headers);
  }
}

function createHttpClient(headers?: Record<string, string>) {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_MIDDLEWARE_API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  return instance;
}

class TracedGraphQLClient {
  private client: GraphQLClient;

  constructor(endpoint: string, options: Record<string, unknown>) {
    this.client = new GraphQLClient(endpoint, options);
  }

  async request<T, V extends Variables = Variables>(
    query: RequestDocument | TypedDocumentNode<T, V>,
    variables?: V,
  ) {
    const reqId = crypto.randomUUID();
    let err: string | null = null;
    let data: T | null = null;

    const { operationName } = resolveRequestDocument(query);

    try {
      window.dispatchEvent(
        new CustomEvent('gql-req', {
          detail: {
            reqId,
            name: operationName,
            variables,
          },
        }),
      );

      const response = await this.client.request<T>(
        query,
        variables as unknown as Record<string, unknown>,
      );

      data = response;

      return response;
    } catch (error) {
      err = error instanceof Error ? error.message : null;
      throw error;
    } finally {
      window.dispatchEvent(
        new CustomEvent('gql-res', {
          detail: {
            reqId,
            data,
            errors: err,
          },
        }),
      );
    }
  }
}

function createGraphqlClient(
  realm: ApiRealm,
  headers?: Record<string, string>,
) {
  const path =
    realm === 'core'
      ? 'customer-os-api'
      : realm === 'mailstack'
      ? 'mailstack'
      : realm === 'leads'
      ? 'leads'
      : 'realtime';

  const url = isTestMode
    ? import.meta.env.VITE_TEST_API_URL
    : `${import.meta.env.VITE_MIDDLEWARE_API_URL}/${path}`;

  // const url = isTestMode
  // ? import.meta.env.VITE_TEST_API_URL
  // : realm === 'leads'
  // ? 'https://leads.customeros.ai/query'
  // : `${import.meta.env.VITE_MIDDLEWARE_API_URL}/${path}`;

  return new TracedGraphQLClient(url, {
    headers,
  });
}

function createStreamClient(headers?: Record<string, string>) {
  const baseUrl = import.meta.env.VITE_MIDDLEWARE_API_URL;

  return async <TData extends object>(
    endpoint: string,
    options: RequestInit & { onData?: (data: TData) => void },
  ) => {
    const response = await fetch(`${baseUrl}/customer-os-stream${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Handle HTTP errors
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let result;
    let buffer = '';

    while (!(result = await reader?.read())?.done) {
      buffer += decoder.decode(result?.value, { stream: true });

      let boundary = buffer.indexOf('\n');

      while (boundary !== -1) {
        const completeChunk = buffer.substring(0, boundary);

        buffer = buffer.substring(boundary + 1);
        boundary = buffer.indexOf('\n');

        if (completeChunk) {
          try {
            const data = JSON.parse(completeChunk);

            options.onData?.(data);
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }
  };
}
