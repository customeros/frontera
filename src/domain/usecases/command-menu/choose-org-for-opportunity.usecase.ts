import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { action, observable } from 'mobx';
import { OrganizationRepository } from '@infra/repositories/core/organization';
import { Organization as OrganizationType } from '@store/Organizations/Organization.dto';

import {
  InternalType,
  InternalStage,
  SortingDirection,
  ComparisonOperator,
} from '@shared/types/__generated__/graphql.types';
export class ChooseOrgForOpportunityUsecase {
  private orgService = OrganizationRepository.getInstance();
  private store: RootStore;
  @observable accessor searchTerm = '';
  @observable accessor organizations: OrganizationType[] = [];

  constructor(store: RootStore) {
    this.setSearchTerm = this.setSearchTerm.bind(this);
    this.searchOrganizations = this.searchOrganizations.bind(this);
    this.store = store;
  }

  @action
  setSearchTerm(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  @action
  async searchOrganizations() {
    const organizations = await this.orgService.searchOrganizations({
      limit: 30,
      sort: {
        by: 'ORGANIZATIONS_NAME',
        caseSensitive: false,
        direction: SortingDirection.Asc,
      },
      where: {
        OR: [
          {
            filter: {
              property: 'ORGANIZATIONS_NAME',
              value: this.searchTerm,
              caseSensitive: false,
              includeEmpty: false,
              operation: ComparisonOperator.Contains,
            },
          },
        ],
      },
    });

    const results = organizations.ui_organizations_search?.ids ?? [];

    if (results.length) {
      this.store.organizations.retrieve(results);

      this.organizations = results.map(
        (id) =>
          this.store.organizations.getById(id) ?? ({} as OrganizationType),
      );
    }
  }

  @action
  execute(orgId: string) {
    const span = Tracer.span('ChooseOrgForOpportunityUsecase.execute');
    const org = this.store.organizations.getById(orgId);

    if (!org) return;

    const stage = this.store.ui.commandMenu.context?.meta?.stage;

    if (!stage) return;

    const isInternalStage =
      stage === InternalStage.ClosedLost || stage === InternalStage.ClosedWon;

    this.store.opportunities.create({
      // @ts-expect-error this will be autofixed when Opportunity store will use OpportunityDatum
      organization: org.value,
      id: org.value.id,
      name:
        this.store.ui.commandMenu.context?.meta?.name ||
        `${org.value.name}'s opportunity`,
      internalType: InternalType.Nbo,
      externalStage: isInternalStage ? '' : stage,
      taskIds: [this.store.ui.commandMenu.context?.meta?.taskId],
    });

    span.end();

    this.store.ui.commandMenu.setOpen(false);
    this.store.ui.commandMenu.setType('OpportunityHub');
    this.store.ui.commandMenu.clearContext();
  }
}
