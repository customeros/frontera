import { OrganizationDocumentsQuery } from './queries/organizationDocuments.generated';

export type DocumentDatum = NonNullable<
  NonNullable<OrganizationDocumentsQuery['organizationDocuments']>[number]
>;
