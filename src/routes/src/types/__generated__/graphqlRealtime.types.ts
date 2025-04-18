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
};

export type CreateDocumentInput = {
  body: Scalars['String']['input'];
  color: Scalars['String']['input'];
  icon: Scalars['String']['input'];
  lexicalState?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId: Scalars['ID']['input'];
  tenant: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type Document = {
  __typename?: 'Document';
  body?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insertedAt: Scalars['String']['output'];
  lexicalState?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  organizationId?: Maybe<Scalars['String']['output']>;
  tenant?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type RootMutationType = {
  __typename?: 'RootMutationType';
  createDocument?: Maybe<Document>;
  deleteDocument?: Maybe<Document>;
  updateDocument?: Maybe<Document>;
};

export type RootMutationTypeCreateDocumentArgs = {
  input: CreateDocumentInput;
};

export type RootMutationTypeDeleteDocumentArgs = {
  id: Scalars['ID']['input'];
};

export type RootMutationTypeUpdateDocumentArgs = {
  input: UpdateDocumentInput;
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  document?: Maybe<Document>;
  organizationDocuments?: Maybe<Array<Maybe<Document>>>;
};

export type RootQueryTypeDocumentArgs = {
  id: Scalars['ID']['input'];
};

export type RootQueryTypeOrganizationDocumentsArgs = {
  organizationId: Scalars['ID']['input'];
};

export type UpdateDocumentInput = {
  color: Scalars['String']['input'];
  icon: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};
