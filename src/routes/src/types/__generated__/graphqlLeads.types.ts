export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Time: { input: any; output: any };
};

export type Connection = {
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  archiveWebtracker: Scalars['Boolean']['output'];
  createWebtracker: Webtracker;
  updateWebtracker: Webtracker;
  verifyWebtrackerCname: Scalars['Boolean']['output'];
};

export type MutationArchiveWebtrackerArgs = {
  id: Scalars['String']['input'];
};

export type MutationCreateWebtrackerArgs = {
  tracker: WebtrackerSaveInput;
};

export type MutationUpdateWebtrackerArgs = {
  tracker: WebtrackerSaveInput;
};

export type MutationVerifyWebtrackerCnameArgs = {
  id: Scalars['String']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  webtracker?: Maybe<Webtracker>;
  webtrackers: Array<Webtracker>;
};

export type QueryWebtrackerArgs = {
  id: Scalars['String']['input'];
};

export type Webtracker = {
  __typename?: 'Webtracker';
  cnameHost: Scalars['String']['output'];
  cnameTarget: Scalars['String']['output'];
  createdAt: Scalars['Time']['output'];
  domain: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  isCnameConfigured: Scalars['Boolean']['output'];
  isProxyActive: Scalars['Boolean']['output'];
  lastEventAt?: Maybe<Scalars['Time']['output']>;
  updatedAt?: Maybe<Scalars['Time']['output']>;
};

export type WebtrackerSaveInput = {
  cnameHost?: InputMaybe<Scalars['String']['input']>;
  domain: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
};
