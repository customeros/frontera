import { GetOrganizationsByIdsQuery } from './queries/getOrganizationsByIds.generated';

export type OrganizationDatum = NonNullable<
  GetOrganizationsByIdsQuery['ui_organizations'][number]
>;
