import { GetOrganizationsByIdsQuery } from './queries/getOrganizationsByIds.generated';
import { SaveOrganizationMutationVariables } from './mutations/saveOrganization.generated';

export type OrganizationDatum = NonNullable<
  GetOrganizationsByIdsQuery['ui_organizations'][number]
>;

export type SaveOrganizationPayload =
  SaveOrganizationMutationVariables['input'];
