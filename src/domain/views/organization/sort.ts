import type { Organization } from '@/domain/entities/organization.entity';

import { match } from 'ts-pattern';

import {
  ColumnViewType,
  OnboardingStatus,
  OrganizationRelationship,
  OpportunityRenewalLikelihood,
} from '@graphql/types';

export const getOrganizationSortFn = (columnId: string) =>
  match(columnId)
    .with(ColumnViewType.OrganizationsName, () => (row: Organization) => {
      if (row.name === null || row.name.trim() === '') return null;

      return row.name.trim().toLowerCase();
    })
    .with(
      ColumnViewType.OrganizationsRelationship,
      () => (row: Organization) =>
        row?.relationship === OrganizationRelationship.Customer,
    )
    .with(
      ColumnViewType.OrganizationsOnboardingStatus,
      () => (row: Organization) =>
        match(row?.onboardingStatus)
          .with(OnboardingStatus.NotApplicable, () => null)
          .with(OnboardingStatus.NotStarted, () => 1)
          .with(OnboardingStatus.OnTrack, () => 2)
          .with(OnboardingStatus.Late, () => 3)
          .with(OnboardingStatus.Stuck, () => 4)
          .with(OnboardingStatus.Successful, () => 5)
          .with(OnboardingStatus.Done, () => 6)
          .otherwise(() => null),
    )
    .with(
      ColumnViewType.OrganizationsRenewalLikelihood,
      () => (row: Organization) =>
        match(row?.renewalSummaryRenewalLikelihood)
          .with(OpportunityRenewalLikelihood.HighRenewal, () => 3)
          .with(OpportunityRenewalLikelihood.MediumRenewal, () => 2)
          .with(OpportunityRenewalLikelihood.LowRenewal, () => 1)
          .otherwise(() => null),
    )
    .with(
      ColumnViewType.OrganizationsUpdatedDate,
      () => (row: Organization) => {
        return row?.updatedAt ? new Date(row?.updatedAt) : null;
      },
    )
    .with(
      ColumnViewType.OrganizationsRenewalDate,
      () => (row: Organization) => {
        const value = row?.renewalSummaryNextRenewalAt;

        return value ? new Date(value) : null;
      },
    )
    .with(
      ColumnViewType.OrganizationsForecastArr,
      () => (row: Organization) => row?.renewalSummaryArrForecast,
    )
    .with(ColumnViewType.OrganizationsOwner, () => (row: Organization) => {
      const name = row?.owner?.name ?? '';
      const firstName = row?.owner?.firstName ?? '';
      const lastName = row?.owner?.lastName ?? '';

      const fullName = (name ?? `${firstName} ${lastName}`).trim();

      return fullName.length ? fullName.toLocaleLowerCase() : null;
    })
    .with(
      ColumnViewType.OrganizationsLeadSource,
      () => (row: Organization) => row?.leadSource,
    )
    .with(
      ColumnViewType.OrganizationsCreatedDate,
      () => (row: Organization) =>
        row?.createdAt ? new Date(row?.createdAt) : null,
    )
    .with(
      ColumnViewType.OrganizationsYearFounded,
      () => (row: Organization) => row?.yearFounded,
    )
    .with(
      ColumnViewType.OrganizationsEmployeeCount,
      () => (row: Organization) => row?.employees,
    )
    .with(
      ColumnViewType.OrganizationsSocials,
      () => (row: Organization) => row?.socialMedia?.[0]?.url,
    )
    .with(
      ColumnViewType.OrganizationsLastTouchpoint,
      () => (row: Organization) => {
        const value = row?.lastTouchPointAt;

        if (!value) return null;

        return new Date(value);
      },
    )
    .with(
      ColumnViewType.OrganizationsLastTouchpointDate,
      () => (row: Organization) => {
        const value = row?.lastTouchPointAt;

        return value ? new Date(value) : null;
      },
    )
    .with(ColumnViewType.OrganizationsChurnDate, () => (row: Organization) => {
      const value = row?.churnedAt;

      return value ? new Date(value) : null;
    })
    .with(
      ColumnViewType.OrganizationsLtv,
      () => (row: Organization) => row?.ltv,
    )
    .with(
      ColumnViewType.OrganizationsIndustry,
      () => (row: Organization) => row?.industryName,
    )
    .with(
      ColumnViewType.OrganizationsContactCount,
      () => (row: Organization) => row?.contacts?.length,
    )
    .with(
      ColumnViewType.OrganizationsLinkedinFollowerCount,
      () => (row: Organization) =>
        row.socialMedia.find((e) => e?.url?.includes('linkedin'))
          ?.followersCount,
    )
    .with(
      ColumnViewType.OrganizationsHeadquarters,
      () => (row: Organization) => {
        return row.country?.toLowerCase() || null;
      },
    )
    .with(
      ColumnViewType.OrganizationsIsPublic,
      () => (row: Organization) => row.public,
    )
    .with(
      ColumnViewType.OrganizationsStage,
      () => (row: Organization) => row.stage?.toLowerCase(),
    )
    .with(ColumnViewType.OrganizationsTags, () => (row: Organization) => {
      return row?.tags?.[0]?.name?.trim().toLowerCase() || null;
    })
    .with(
      ColumnViewType.OrganizationsParentOrganization,
      () => (row: Organization) => {
        return row?.parentName?.trim().toLowerCase() || null;
      },
    )
    .otherwise(() => (_row: Organization) => false);
