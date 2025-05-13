import { Organization } from '@/domain/entities';

import { DateTimeUtils } from '@utils/date.ts';
import { ColumnViewType } from '@graphql/types';

export const csvDataMapper = {
  [ColumnViewType.OrganizationsAvatar]: (d: Organization) => d?.logoUrl,
  [ColumnViewType.OrganizationsName]: (d: Organization) => d.name,
  [ColumnViewType.OrganizationsUpdatedDate]: (d: Organization) =>
    d?.updatedAt
      ? DateTimeUtils.format(d.updatedAt, DateTimeUtils.iso8601)
      : 'Unknown',
  [ColumnViewType.OrganizationsLeadSource]: (d: Organization) =>
    d?.leadSource || 'Unknown',
  [ColumnViewType.OrganizationsOwner]: (d: Organization) => {
    return d.owner?.name ?? 'No owner';
  },

  [ColumnViewType.OrganizationsCreatedDate]: (d: Organization) =>
    DateTimeUtils.format(d.createdAt, DateTimeUtils.iso8601),
  [ColumnViewType.OrganizationsYearFounded]: (d: Organization) => d.yearFounded,
  [ColumnViewType.OrganizationsEmployeeCount]: (d: Organization) => d.employees,
  [ColumnViewType.OrganizationsSocials]: (d: Organization) =>
    d.socialMedia.find((e) => e?.url?.includes('linkedin'))?.url,
  [ColumnViewType.OrganizationsPrimaryDomains]: (d: Organization) =>
    d.domainsDetails
      .filter((e) => e.primary)
      ?.map((e) => e.domain)
      .join('; '),

  [ColumnViewType.OrganizationsIndustry]: (d: Organization) =>
    d.industryName ?? 'Unknown',
  [ColumnViewType.OrganizationsContactCount]: (d: Organization) =>
    d?.contacts?.length,
  [ColumnViewType.OrganizationsLinkedinFollowerCount]: (d: Organization) =>
    d?.socialMedia.find((e) => e?.url?.includes('linkedin'))?.followersCount ??
    'Unknown',
  [ColumnViewType.OrganizationsTags]: (d: Organization) =>
    d?.tags?.map((e) => e.name).join('; '),
  [ColumnViewType.OrganizationsIsPublic]: (d: Organization) =>
    d?.public ? 'Public' : 'Private',
  [ColumnViewType.OrganizationsStage]: (d: Organization) => d.stage,
  [ColumnViewType.OrganizationsCity]: (d: Organization) =>
    d?.locations?.[0]?.countryCodeA2,
  [ColumnViewType.OrganizationsHeadquarters]: (d: Organization) =>
    d?.locations?.[0]?.countryCodeA2,
};
