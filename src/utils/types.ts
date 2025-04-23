import { FilterItem as ServerFilterItem } from '@graphql/types';

export type FilterItem = ServerFilterItem & { active?: boolean };
