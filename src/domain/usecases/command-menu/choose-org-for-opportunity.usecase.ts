import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { action, observable } from 'mobx';
import { Organization } from '@/domain/entities';
import { registry } from '@/domain/stores/registry';
import { OrganizationService } from '@/domain/services';

import {
  InternalType,
  InternalStage,
} from '@shared/types/__generated__/graphql.types';

export class ChooseOrgForOpportunityUsecase {
  private store: RootStore;
  private organizationService = new OrganizationService();
  @observable accessor searchTerm = '';
  @observable accessor organizations: Organization[] = [];

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
    const [res, err] = await this.organizationService.searchTenant(
      this.searchTerm,
    );

    if (err) {
      console.error(
        'ChooseOrgForOpportunityUsecase.searchOrganizations: Failed searching tenant organizations',
      );
    }

    if (!res) return;

    const results = res.ui_organizations_search?.ids ?? [];

    if (results.length) {
      this.organizations = results.map(
        (id) =>
          registry.get('organizations').get(id) ?? new Organization({ id }),
      );
    }
  }

  @action
  execute(orgId: string) {
    const span = Tracer.span('ChooseOrgForOpportunityUsecase.execute');
    const org = registry.get('organizations').get(orgId);

    if (!org) return;

    const stage = this.store.ui.commandMenu.context?.meta?.stage;

    if (!stage) return;

    const isInternalStage =
      stage === InternalStage.ClosedLost || stage === InternalStage.ClosedWon;

    this.store.opportunities.create({
      // @ts-expect-error this will be autofixed when Opportunity store will use OpportunityDatum
      organization: org.value,
      id: org.id,
      name:
        this.store.ui.commandMenu.context?.meta?.name ||
        `${org.name}'s opportunity`,
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
