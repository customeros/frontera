import { OrganizationDocumentsQuery } from './queries/oranizationDocuments.generated';

export type DocumentDatum = NonNullable<
  NonNullable<OrganizationDocumentsQuery['organizationDocuments']>[number]
>;
