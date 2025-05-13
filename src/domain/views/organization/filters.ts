import type { RootStore } from '@/store/root';
import type { FilterItem } from '@/utils/types';
import type { Organization } from '@/domain/entities';

import { match } from 'ts-pattern';
import { set } from 'date-fns/set';
import { isBefore } from 'date-fns';
import { isAfter } from 'date-fns/isAfter';
import { OrganizationAggregate } from '@/domain/aggregates/organization.aggregate';

import {
  Filter,
  ColumnViewType,
  ComparisonOperator,
  OrganizationRelationship,
} from '@graphql/types';

const getFilterV2Fn = (
  filter: FilterItem | undefined | null,
  rootStore: RootStore,
) => {
  const noop = (_row: Organization) => true;

  if (!filter) return noop;

  return match(filter)
    .with({ property: 'STAGE' }, (filter) => (row: Organization) => {
      const filterValues = filter?.value;

      if (!filterValues) return false;

      return filterValues.includes(row?.stage);
    })
    .with({ property: 'IS_CUSTOMER' }, (filter) => (row: Organization) => {
      const filterValues = filter?.value;

      if (!filterValues) return false;

      return filterValues.includes(
        row?.relationship === OrganizationRelationship.Customer,
      );
    })
    .with({ property: 'OWNER_ID' }, (filter) => (row: Organization) => {
      const filterValues = filter?.value;

      if (!filterValues) return false;

      return filterValues.includes(row?.owner?.id);
    })

    .with({ property: 'RELATIONSHIP' }, (filter) => (row: Organization) => {
      const filterValues = filter?.value;

      if (!filterValues) return false;

      return filterValues.includes(row?.relationship);
    })
    .with(
      { property: ColumnViewType.OrganizationsCreatedDate },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const value = row?.createdAt;

        return filterTypeDate(filter, value);
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsName },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const values = row?.name?.toLowerCase();

        return filterTypeText(filter, values);
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsPrimaryDomains },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const organizationAggregate = new OrganizationAggregate(row, rootStore);
        const value = organizationAggregate.primaryDomains?.join(' ') || '';

        return filterTypeText(filter, value);
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsStage },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;
        const values = row?.stage;

        if (!values)
          return (
            filter.operation === ComparisonOperator.IsEmpty ||
            filter.operation === ComparisonOperator.NotIn
          );

        return filterTypeList(
          filter,
          Array.isArray(values) ? values : [values],
        );
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsOwner },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const values = row?.owner?.id;

        if (!values)
          return (
            filter.operation === ComparisonOperator.IsEmpty ||
            filter.operation === ComparisonOperator.NotContains
          );

        return filterTypeList(
          filter,
          Array.isArray(values) ? values : [values],
        );
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsSocials },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const linkedinSocial = row?.socialMedia?.find((v) =>
          v.url.toLowerCase().includes('linkedin'),
        );
        const linkedInStr = linkedinSocial?.alias || linkedinSocial?.url;

        return filterTypeText(filter, linkedInStr);
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsEmployeeCount },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const employees = row?.employees;

        return filterTypeNumber(filter, employees);
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsContactCount },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;
        const contactsCount = row?.contacts.length;

        return filterTypeNumber(filter, contactsCount);
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsLinkedinFollowerCount },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const followers = row?.socialMedia.find((e) =>
          e?.url?.includes('linkedin'),
        )?.followersCount;

        return filterTypeNumber(filter, followers);
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsLeadSource },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const value = row?.leadSource;

        if (!value)
          return (
            filter.operation === ComparisonOperator.IsEmpty ||
            filter.operation === ComparisonOperator.NotContains
          );

        return filterTypeList(filter, Array.isArray(value) ? value : [value]);
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsIndustry },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;
        const value = row?.industryCode;

        if (!value)
          return (
            filter.operation === ComparisonOperator.IsEmpty ||
            filter.operation === ComparisonOperator.NotContains
          );

        return filterTypeList(filter, Array.isArray(value) ? value : [value]);
      },
    )
    .with({ property: ColumnViewType.OrganizationsCountry }, (filter) => {
      return (row: Organization) => {
        if (!filter.active) return true;
        const locations = row?.locations;
        const country = locations?.[0]?.countryCodeA2;

        if (!country)
          return (
            filter.operation === ComparisonOperator.IsEmpty ||
            filter.operation === ComparisonOperator.NotContains
          );

        return filterTypeList(
          filter,
          Array.isArray(country) ? country : [country],
        );
      };
    })
    .with(
      { property: ColumnViewType.OrganizationsIsPublic },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const isPublic = row?.public === true ? 'Public' : 'Private';

        return filterTypeList(
          filter,
          Array.isArray(isPublic) ? isPublic.map(String) : [String(isPublic)],
        );
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsYearFounded },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;

        const yearFounded = row?.yearFounded;

        if (!yearFounded) return false;

        return filterTypeNumber(filter, yearFounded);
      },
    )
    .with(
      { property: ColumnViewType.OrganizationsTags },
      (filter) => (row: Organization) => {
        if (!filter.active) return true;
        const values = row?.tags?.map((l) => l.metadata.id);

        if (!values)
          return (
            filter.operation === ComparisonOperator.IsEmpty ||
            filter.operation === ComparisonOperator.NotContains
          );

        return filterTypeList(
          filter,
          Array.isArray(values) ? values : [values],
        );
      },
    )

    .otherwise(() => noop);
};

const filterTypeText = (filter: FilterItem, value: string | undefined) => {
  const filterValue = filter?.value?.toLowerCase();
  const filterOperator = filter?.operation;
  const valueLower = value?.toLowerCase();

  return match(filterOperator)
    .with(ComparisonOperator.IsEmpty, () => !value)
    .with(ComparisonOperator.IsNotEmpty, () => value)
    .with(
      ComparisonOperator.NotContains,
      () => !valueLower?.includes(filterValue),
    )
    .with(ComparisonOperator.Contains, () => valueLower?.includes(filterValue))
    .otherwise(() => false);
};

const filterTypeNumber = (filter: FilterItem, value: number | undefined) => {
  const filterValue = filter?.value;
  const filterOperator = filter?.operation;

  if (value === undefined || value === null) return false;

  return match(filterOperator)
    .with(ComparisonOperator.Lt, () => value < Number(filterValue))
    .with(ComparisonOperator.Gt, () => value > Number(filterValue))
    .with(ComparisonOperator.Equals, () => value === Number(filterValue))
    .with(ComparisonOperator.NotEquals, () => value !== Number(filterValue))
    .otherwise(() => true);
};

const filterTypeList = (filter: FilterItem, value: string[] | undefined) => {
  const filterValue = filter?.value;
  const filterOperator = filter?.operation;

  return match(filterOperator)
    .with(ComparisonOperator.IsEmpty, () => !value?.length)
    .with(ComparisonOperator.IsNotEmpty, () => value?.length)
    .with(ComparisonOperator.NotIn, () => {
      return !value?.some((v) => filterValue?.includes(v));
    })
    .with(
      ComparisonOperator.In,
      () => value?.length && value.some((v) => filterValue?.includes(v)),
    )
    .otherwise(() => false);
};

const filterTypeDate = (filter: FilterItem, value: string | undefined) => {
  const filterValue = filter?.value;
  const filterOperator = filter?.operation;

  if (!value) return false;

  const left = set(new Date(value), { hours: 0, minutes: 0, seconds: 0 });
  const right = set(new Date(filterValue), {
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  return match(filterOperator)
    .with(ComparisonOperator.Lt, () => isBefore(left, right))
    .with(ComparisonOperator.Gt, () => isAfter(left, right))

    .otherwise(() => true);
};

export const getOrganizationFilterFns = (
  filters: Filter | null,
  rootStore: RootStore,
) => {
  if (!filters || !filters.AND) return [];

  const data = filters?.AND;

  return data.map(({ filter }) => getFilterV2Fn(filter, rootStore));
};
