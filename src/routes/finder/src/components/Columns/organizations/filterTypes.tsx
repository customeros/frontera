import { Cake } from '@ui/media/icons/Cake';
import { Key01 } from '@ui/media/icons/Key01';
import { Tag01 } from '@ui/media/icons/Tag01';
import { Hash02 } from '@ui/media/icons/Hash02';
import { Globe01 } from '@ui/media/icons/Globe01';
import { Users03 } from '@ui/media/icons/Users03';
import { Calendar } from '@ui/media/icons/Calendar';
import { Columns03 } from '@ui/media/icons/Columns03';
import { Building07 } from '@ui/media/icons/Building07';
import { Building05 } from '@ui/media/icons/Building05';
import { ArrowCircleDownRight } from '@ui/media/icons/ArrowCircleDownRight';
import {
  EntityType,
  ColumnViewType,
  OrganizationStage,
  ComparisonOperator,
} from '@shared/types/__generated__/graphql.types';

export type FilterType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any[];
  icon: JSX.Element;
  filterName: string;
  filterAccesor: ColumnViewType;
  filterOperators: ComparisonOperator[];
  filterType: 'text' | 'date' | 'number' | 'list';
  groupOptions?: { label: string; options: { id: string; label: string }[] };
};

import uniqBy from 'lodash/uniqBy';
import { type RootStore } from '@store/root';
import { registry } from '@domain/stores/registry';
import { countryMap } from '@assets/countries/countriesMap';

import { Globe04 } from '@ui/media/icons/Globe04';
import { LinkedinOutline } from '@ui/media/icons/LinkedinOutline';

export const getFilterTypes = (store?: RootStore) => {
  const filterTypes: Partial<Record<ColumnViewType, FilterType>> = {
    [ColumnViewType.OrganizationsName]: {
      filterType: 'text',
      filterName: 'Company name',
      filterAccesor: ColumnViewType.OrganizationsName,
      filterOperators: [
        ComparisonOperator.Contains,
        ComparisonOperator.NotContains,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <Building07 className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
    },
    [ColumnViewType.OrganizationsPrimaryDomains]: {
      filterType: 'text',
      filterName: 'Primary Domain',
      filterAccesor: ColumnViewType.OrganizationsPrimaryDomains,
      filterOperators: [
        ComparisonOperator.Contains,
        ComparisonOperator.NotContains,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <Globe01 className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
    },
    [ColumnViewType.OrganizationsOwner]: {
      filterType: 'list',
      filterName: 'Owner',
      filterAccesor: ColumnViewType.OrganizationsOwner,
      filterOperators: [
        ComparisonOperator.In,
        ComparisonOperator.NotIn,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: <Key01 />,
      options: store?.users.toArray().map((user) => ({
        id: user?.id,
        label: user?.name,
        avatar: user?.value?.profilePhotoUrl,
      })),
    },
    [ColumnViewType.OrganizationsLeadSource]: {
      filterType: 'list',
      filterName: 'Source',
      filterAccesor: ColumnViewType.OrganizationsLeadSource,
      filterOperators: [
        ComparisonOperator.In,
        ComparisonOperator.NotIn,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <ArrowCircleDownRight className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
      options: uniqBy(
        Array.from(registry.get('organizations').cache).map(([_, v]) => v),
        'value.leadSource',
      )
        .map((v) => v.leadSource)
        .filter(Boolean)
        .map((leadSource) => ({
          id: leadSource,
          label: leadSource,
        })),
    },
    [ColumnViewType.OrganizationsCreatedDate]: {
      filterType: 'date',
      filterName: 'Created date',
      filterAccesor: ColumnViewType.OrganizationsCreatedDate,
      filterOperators: [ComparisonOperator.Lt, ComparisonOperator.Gt],
      icon: (
        <Calendar className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
    },
    [ColumnViewType.OrganizationsYearFounded]: {
      filterType: 'number',
      filterName: 'Founded',
      filterAccesor: ColumnViewType.OrganizationsYearFounded,
      filterOperators: [
        ComparisonOperator.Gt,
        ComparisonOperator.Lt,
        ComparisonOperator.Equals,
        ComparisonOperator.NotEquals,
      ],
      icon: (
        <Cake className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
    },
    [ColumnViewType.OrganizationsEmployeeCount]: {
      filterType: 'number',
      filterName: 'Employees',
      filterAccesor: ColumnViewType.OrganizationsEmployeeCount,
      filterOperators: [
        ComparisonOperator.Gt,
        ComparisonOperator.Lt,
        ComparisonOperator.Equals,
        ComparisonOperator.NotEquals,
      ],
      icon: (
        <Users03 className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
    },
    [ColumnViewType.OrganizationsSocials]: {
      filterType: 'text',
      filterName: 'LinkedIn URL',
      filterAccesor: ColumnViewType.OrganizationsSocials,
      filterOperators: [
        ComparisonOperator.Contains,
        ComparisonOperator.NotContains,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <LinkedinOutline className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
    },
    [ColumnViewType.OrganizationsIndustry]: {
      filterType: 'list',
      filterName: 'Industry',
      filterAccesor: ColumnViewType.OrganizationsIndustry,
      filterOperators: [
        ComparisonOperator.In,
        ComparisonOperator.NotIn,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: <Building05 />,
      options: store?.industries?.toArray().map((industry) => ({
        id: industry.value.code,
        label: industry.value.name,
      })),
    },
    [ColumnViewType.OrganizationsContactCount]: {
      filterType: 'number',
      filterName: 'Contact count',
      filterAccesor: ColumnViewType.OrganizationsContactCount,
      filterOperators: [
        ComparisonOperator.Gt,
        ComparisonOperator.Lt,
        ComparisonOperator.Equals,
        ComparisonOperator.NotEquals,
      ],
      icon: (
        <Hash02 className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
    },
    [ColumnViewType.OrganizationsTags]: {
      filterType: 'list',
      filterName: 'Tags',
      filterAccesor: ColumnViewType.OrganizationsTags,
      filterOperators: [
        ComparisonOperator.In,
        ComparisonOperator.NotIn,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <Tag01 className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
      options: store?.tags
        .toArray()
        .filter((t) => t.value.entityType === EntityType.Organization)
        .map((tag) => ({
          id: tag.value.metadata.id,
          label: tag.value.name,
        })),
    },

    [ColumnViewType.OrganizationsCountry]: {
      filterType: 'list',
      filterName: 'Country',
      filterAccesor: ColumnViewType.OrganizationsCountry,
      filterOperators: [
        ComparisonOperator.In,
        ComparisonOperator.NotIn,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <Globe04 className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
      options: Array.from(countryMap).map(([key, value]) => ({
        id: key.toUpperCase(),
        label: value,
      })),
    },

    [ColumnViewType.OrganizationsIsPublic]: {
      filterType: 'list',
      filterName: 'Ownership type',
      filterAccesor: ColumnViewType.OrganizationsIsPublic,
      filterOperators: [
        ComparisonOperator.In,
        ComparisonOperator.NotIn,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <Key01 className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
      options: [
        { id: 'Public', label: 'Public' },
        { id: 'Private', label: 'Private' },
      ],
    },
    [ColumnViewType.OrganizationsStage]: {
      filterType: 'list',
      filterName: 'Stage',
      filterAccesor: ColumnViewType.OrganizationsStage,
      filterOperators: [
        ComparisonOperator.In,
        ComparisonOperator.NotIn,
        ComparisonOperator.IsEmpty,
        ComparisonOperator.IsNotEmpty,
      ],
      icon: (
        <Columns03 className='group-hover:text-grayModern-700 text-grayModern-500 mb-0.5' />
      ),
      options: [
        {
          label: 'Lead',
          id: OrganizationStage.Lead,
        },
        {
          label: 'Target',
          id: OrganizationStage.Target,
        },
        {
          label: 'Engaged',
          id: OrganizationStage.Engaged,
        },
        {
          label: 'Trial',
          id: OrganizationStage.Trial,
        },
        {
          label: 'Unqualified',
          id: OrganizationStage.Unqualified,
        },
      ],
    },
  };

  return filterTypes;
};
