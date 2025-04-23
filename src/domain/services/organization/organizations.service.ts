import { Tracer } from '@infra/tracer';
import { Logger } from '@/infra/logger';
import { RootStore } from '@/store/root';
import { Social } from '@/domain/objects';
import { injectable } from '@/infra/container';
import { UtilService } from '@/domain/services';
import { TagStore } from '@/store/Tags/Tag.store';
import { registry } from '@/domain/stores/registry';
import { Organization } from '@/domain/entities/organization.entity';
import { OrganizationRepository } from '@/infra/repositories/core/organization';
import { OrganizationViews } from '@domain/views/organization/organization.views';
import { OrganizationAggregate } from '@/domain/aggregates/organization.aggregate';
import { CheckWebsiteQuery } from '@infra/repositories/core/organization/queries/checkWebsite.generated';
import { SearchOrganizationsQuery } from '@/infra/repositories/core/organization/queries/searchOrganizations.generated';
import { SearchGlobalOrganizationsQuery } from '@infra/repositories/core/organization/queries/searchGlobalOrganizations.generated';

import { unwrap, UnwrapResult } from '@utils/unwrap';
import {
  relationshipStageMap,
  stageRelationshipMap,
  validRelationshipsForStage,
} from '@utils/orgStageAndRelationshipStatusMap';
import {
  Domain,
  EntityType,
  FlagWrongFields,
  SortingDirection,
  OrganizationStage,
  ComparisonOperator,
  OrganizationRelationship,
  OpportunityRenewalLikelihood,
} from '@shared/types/__generated__/graphql.types';

@injectable
export class OrganizationService {
  private root = RootStore.getInstance();
  private utilService = new UtilService();
  private organizationStore = registry.get('organizations');
  private orgRepo = OrganizationRepository.getInstance();
  private logger = new Logger('OrganizationService');

  constructor() {}

  public async create(organization: Organization) {
    const tempId = organization.id;

    this.organizationStore.suspendSync(() => {
      this.organizationStore.set(tempId, organization);
    });

    const [res, err] = await unwrap(
      this.orgRepo.saveOrganization({ input: organization.toCreatePayload() }),
    );

    if (err) {
      this.logger.append('create').error('Failed creating organization', err);
    }

    if (res) {
      organization.setId(res.organization_Save.metadata.id);
      this.organizationStore.suspendSync(() => {
        this.organizationStore.delete(tempId);
      });
      this.organizationStore.sync(organization);
      OrganizationViews.revalidate(organization);
    }
  }

  public async import(globalId: string, organization: Organization) {
    const tempId = organization.id;

    this.organizationStore.suspendSync(() => {
      this.organizationStore.set(tempId, organization);
    });

    OrganizationViews.revalidate(organization);

    const [res, err] = await unwrap(
      this.orgRepo.importOrganization({
        globalOrganizationId: Number(globalId),
        input: {
          relationship: organization?.relationship,
          stage: organization?.stage,
        },
      }),
    );

    if (err) {
      this.logger.append('import').error('Failed importing organization', err);
    }

    if (res) {
      const id = res.organization_SaveByGlobalOrganization.id;

      organization.setId(id);
      this.organizationStore.suspendSync(() => {
        this.organizationStore.delete(tempId);
      });
      this.organizationStore.set(id, organization);
      this.organizationStore.revalidate(id);
      OrganizationViews.revalidate(organization);
    }

    return [res, err];
  }

  public async searchTenant(
    searchTerm: string,
  ): Promise<UnwrapResult<SearchOrganizationsQuery>> {
    const [searchRes, searchErr] = await unwrap(
      this.orgRepo.searchOrganizations({
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
                value: searchTerm,
                caseSensitive: false,
                includeEmpty: false,
                operation: ComparisonOperator.Contains,
              },
            },
            {
              filter: {
                property: 'ORGANIZATIONS_WEBSITE',
                value: searchTerm,
                caseSensitive: false,
                includeEmpty: false,
                operation: ComparisonOperator.Contains,
              },
            },
          ],
        },
      }),
    );

    if (searchErr) {
      console.error(
        'OrganizationService.searchTenant: Failed searching organizations',
      );

      return [searchRes, searchErr];
    }

    const foundIds = searchRes?.ui_organizations_search.ids;

    if (!foundIds || foundIds?.length === 0) {
      return [searchRes, searchErr];
    }

    const [retrieveRes, retrieveErr] = await unwrap(
      this.orgRepo.getOrganizationsByIds({ ids: foundIds }),
    );

    if (retrieveErr) {
      console.error(
        'OrganizationService.searchTenant: Failed retrieving organizations',
      );

      return [searchRes, searchErr];
    }

    this.organizationStore.suspendSync(() => {
      retrieveRes?.ui_organizations.forEach((data) => {
        this.organizationStore.set(data.id, new Organization(data));
      });
    });

    return [searchRes, searchErr];
  }

  public async searchGlobal(
    searchTerm: string,
    limit: number,
  ): Promise<UnwrapResult<SearchGlobalOrganizationsQuery>> {
    const [res, err] = await unwrap(
      this.orgRepo.searchGlobalOrganizations({ searchTerm, limit }),
    );

    if (err) {
      console.error(
        'OrganizationStore.searchGlobal: Failed searching global organizations',
      );
    }

    return [res, err];
  }

  public async fetchIds(ids: string[]) {
    const [res, err] = await unwrap(
      this.orgRepo.getOrganizationsByIds({ ids }),
    );

    if (err) {
      console.error(
        'OrganizationStore.fetchIds: Failed searching global organizations',
      );
    }

    return [res, err];
  }

  public async merge(
    targetOrganization: Organization,
    sourceOrganizations: Organization[],
  ) {
    const organizationAggregate = new OrganizationAggregate(
      targetOrganization,
      this.root,
    );

    organizationAggregate.mergeOrganizations(sourceOrganizations);

    OrganizationViews.mutateCache((view) => {
      sourceOrganizations.forEach((o) => {
        if (view.data.includes(o)) {
          view.data = view.data.filter((e) => e !== o);
          view.totalElements--;
        }
      });
    });

    const [_, err] = await unwrap(
      this.orgRepo.mergeOrganizations({
        primaryOrganizationId: targetOrganization.id,
        mergedOrganizationIds: sourceOrganizations.map((o) => o.id),
      }),
    );

    if (err) {
      console.error('OrganizationService.merge: Unable to merge organizations');

      return;
    }
  }

  public async flagWrongField(
    organization: Organization,
    field: FlagWrongFields,
  ) {
    const [_, err] = await unwrap(
      this.orgRepo.flagWrongField({
        input: {
          entityId: organization.id,
          entityType: EntityType.Organization,
          field,
        },
      }),
    );

    if (err) {
      console.error(
        'OrganizationService.flagWrongField: Failed to flag wrong field',
      );

      return;
    }

    organization.flagIncorrectIndustry();
    this.organizationStore.sync(organization);
  }

  public async addTag(organization: Organization, tag: TagStore) {
    const span = Tracer.span('OrganizationService.addTag', {
      organizationId: organization.id,
      tag: tag.value,
    });
    const organizationAggregate = new OrganizationAggregate(
      organization,
      this.root,
    );

    organizationAggregate.addTag(tag.id);

    const [res, err] = await unwrap(
      this.orgRepo.addTag({
        input: { organizationId: organization.id, tag: { name: tag.tagName } },
      }),
    );

    if (err) {
      console.error(err);
      organizationAggregate.deleteTag(tag.id);

      this.utilService.toastError('Failed to add tag to company');

      return [null, err];
    }

    if (res) {
      this.organizationStore.sync(organization);
      this.utilService.toastSuccess('Tag added', 'add-tag');
    }

    span.end();

    return [res, err];
  }

  public async removeTag(organization: Organization, tag: TagStore) {
    const organizationAggregate = new OrganizationAggregate(
      organization,
      this.root,
    );

    organizationAggregate.deleteTag(tag.id);

    const [res, err] = await unwrap(
      this.orgRepo.removeTag({
        input: { organizationId: organization.id, tag: { name: tag.tagName } },
      }),
    );

    if (err) {
      console.error(err);
      organizationAggregate.addTag(tag.id);

      this.utilService.toastError('Failed to remove tag from company');

      return [null, err];
    }

    if (res) {
      this.organizationStore.sync(organization);
    }

    return [res, err];
  }

  public async removeSocialMediaItem(
    organization: Organization,
    social: Social,
  ) {
    organization.deleteSocial(social.id);

    const [res, err] = await unwrap(
      this.orgRepo.removeSocial({
        socialId: social.id,
      }),
    );

    if (err) {
      console.error(err);
      organization.revertSocial(social);

      this.utilService.toastError("We couldn't remove this link");

      return [null, err];
    }

    this.organizationStore.sync(organization);

    return [res, err];
  }

  public async addDomain(organization: Organization, domain: Domain) {
    organization.addDomain(domain);

    const [res, err] = await unwrap(
      this.orgRepo.addDomain({
        organizationId: organization.id,
        domain: domain.domain,
      }),
    );

    if (err) {
      console.error(err);
      organization.deleteDomain(domain.domain);

      this.utilService.toastError("We couldn't add this domain");

      return [null, err];
    }

    this.organizationStore.sync(organization);

    return [res, err];
  }

  public async removeDomain(organization: Organization, domain: string) {
    const domainDetailsToRestore = organization.domainsDetails.find(
      (d) => d.domain !== domain,
    );

    organization.deleteDomain(domain);

    const [res, err] = await unwrap(
      this.orgRepo.removeDomain({
        organizationId: organization.id,
        domain: domain,
      }),
    );

    if (err) {
      console.error(err);

      if (domainDetailsToRestore) {
        organization.addDomain(domainDetailsToRestore);
      }

      this.utilService.toastError("We couldn't remove this domain");

      return [null, err];
    }

    this.organizationStore.sync(organization);

    return [res, err];
  }

  public async setOwner(organization: Organization, ownerId: string) {
    const prev = { ...organization };

    const organizationAggregate = new OrganizationAggregate(
      organization,
      this.root,
    );

    organizationAggregate.setOwner(ownerId);

    const [res, err] = await unwrap(
      this.orgRepo.saveOrganization({
        input: {
          id: organization.id,
          ownerId,
        },
      }),
    );

    if (err) {
      console.error(err);
      Object.assign(organization, prev);

      this.utilService.toastError("We couldn't change the owner");

      return [null, err];
    }

    if (res) {
      this.root.ui.toastSuccess(
        'Owner changed successfully',
        `${ownerId}-edit-owner`,
      );

      this.organizationStore.sync(organization);
    }

    return [res, err];
  }

  public async setRelationship(
    organization: Organization,
    relationship: OrganizationRelationship,
  ) {
    const prev = { ...organization };

    organization?.setRelationship(relationship);

    const [res, err] = await unwrap(
      this.orgRepo.saveOrganization({
        input: {
          id: organization.id,
          relationship,
          stage: organization.stage,
        },
      }),
    );

    if (err) {
      console.error(err);
      Object.assign(organization, prev);
    }

    this.organizationStore.sync(organization);

    return [res, err];
  }

  public async setStage(organization: Organization, stage: OrganizationStage) {
    const prev = { ...organization };

    organization.setStage(stage);

    const [res, err] = await unwrap(
      this.orgRepo.saveOrganization({
        input: {
          id: organization.id,
          stage: organization.stage,
        },
      }),
    );

    if (err) {
      console.error(err);
      Object.assign(organization, prev);
    }

    this.organizationStore.sync(organization);

    return [res, err];
  }

  public async setHealth(
    organization: Organization,
    renewalLikelihood: OpportunityRenewalLikelihood,
  ) {
    const prev = { ...organization };

    organization.setRenewalAdjustedRate(renewalLikelihood);

    const amount = organization.renewalSummaryArrForecast ?? 0;
    const potentialAmount = organization.renewalSummaryMaxArrForecast ?? 0;
    const rate =
      amount === 0 || potentialAmount === 0
        ? 0
        : (amount / potentialAmount) * 100;

    const [res, err] = await unwrap(
      this.orgRepo.updateAllOpportunityRenewals({
        input: {
          organizationId: organization.id,
          renewalAdjustedRate: rate,
          renewalLikelihood: organization.renewalSummaryRenewalLikelihood,
        },
      }),
    );

    if (err) {
      console.error(err);

      Object.assign(organization, prev);
      this.utilService.toastError('Failed to update opportunity renewals');

      return [null, err];
    }

    this.organizationStore.sync(organization);

    return [res, err];
  }

  public async setNotes(organization: Organization, notes: string) {
    const prevNotes = organization.notes ?? '';

    organization.setNotes(notes);

    const [res, err] = await unwrap(
      this.orgRepo.saveOrganization({
        input: {
          id: organization.id,
          notes,
        },
      }),
    );

    if (err) {
      console.error(err);
      organization.setNotes(prevNotes);

      this.utilService.toastError('Failed to update notes');

      return [null, err];
    }

    this.organizationStore.sync(organization);

    return [res, err];
  }

  public async validateDomain(
    website: string,
  ): Promise<UnwrapResult<CheckWebsiteQuery>> {
    const [res, err] = await unwrap(
      this.orgRepo.checkWebsite({
        website,
      }),
    );

    if (err) {
      console.error(
        'OrganizationService.validateDomain: Failed validating organization domain',
      );
    }

    return [res, err];
  }

  public async setStageBulk(
    organizationIds: string[],
    stage: OrganizationStage,
  ) {
    let invalidCustomerStageCount = 0;

    organizationIds.forEach((id) => {
      const organization = this.organizationStore.get(id);

      if (!organization) return;

      const currentRelationship = organization.relationship;
      const newDefaultRelationship = stageRelationshipMap[stage];
      const validRelationships = validRelationshipsForStage[stage];

      if (
        currentRelationship &&
        validRelationships?.includes(currentRelationship)
      ) {
        organization.stage = stage;
      } else if (currentRelationship === OrganizationRelationship.Customer) {
        invalidCustomerStageCount++;

        // Do not update if current relationship is Customer and new stage is not valid
      } else {
        organization.setStage(stage);
        organization.setRelationship(
          newDefaultRelationship || organization.relationship,
        );
      }
    });

    if (invalidCustomerStageCount) {
      this.utilService.toastError(
        `${invalidCustomerStageCount} customer${
          invalidCustomerStageCount > 1 ? 's' : ''
        } remain unchanged`,
      );

      return;
    }

    const promises = organizationIds.map((id) => {
      return unwrap(
        this.orgRepo.saveOrganization({
          input: {
            id,
            stage,
          },
        }),
      );
    });

    await Promise.all(promises);
  }

  public async setReltionshipBulk(
    organizationIds: string[],
    relationship: OrganizationRelationship,
  ) {
    let invalidCustomerStageCount = 0;

    organizationIds.forEach((id) => {
      const organization = this.organizationStore.get(id);

      if (!organization) return;

      if (
        organization.relationship === OrganizationRelationship.Customer &&
        ![
          OrganizationRelationship.FormerCustomer,
          OrganizationRelationship.NotAFit,
        ].includes(relationship)
      ) {
        invalidCustomerStageCount++;

        return; // Do not update if current is customer and new is not formet customer or not a fit
      }

      organization?.setRelationship(relationship);
      organization?.relationship &&
        organization?.setStage(
          relationshipStageMap[organization.relationship!],
        );
    });

    if (invalidCustomerStageCount) {
      this.utilService.toastError(
        `${invalidCustomerStageCount} customer${
          invalidCustomerStageCount > 1 ? 's' : ''
        } remain unchanged`,
      );

      return;
    }

    const promises = organizationIds.map((id) => {
      const stage = this.organizationStore.get(id)?.stage;

      return unwrap(
        this.orgRepo.saveOrganization({
          input: {
            id,
            relationship,
            stage,
          },
        }),
      );
    });

    await Promise.all(promises);
  }

  public async clearTagsBulk(organizationIds: string[]) {
    const promises: Promise<UnwrapResult<unknown>>[] = [];

    organizationIds.forEach((id) => {
      const organization = this.organizationStore.get(id);

      if (!organization) return;

      organization.tags.forEach((t) => {
        promises.push(
          unwrap(
            this.orgRepo.removeTag({
              input: { organizationId: id, tag: { id: t.metadata.id } },
            }),
          ),
        );
      });

      new OrganizationAggregate(organization, this.root).clearTags();
    });

    await Promise.all(promises);
  }

  public async setHealthBulk(
    organizationIds: string[],
    renewalLikelihood: OpportunityRenewalLikelihood,
  ) {
    const promises: Promise<UnwrapResult<unknown>>[] = [];

    organizationIds.forEach((id) => {
      const organization = this.organizationStore.get(id);

      if (!organization) return;

      organization.setRenewalAdjustedRate(renewalLikelihood);

      const amount = organization.renewalSummaryArrForecast ?? 0;
      const potentialAmount = organization.renewalSummaryMaxArrForecast ?? 0;
      const rate =
        amount === 0 || potentialAmount === 0
          ? 0
          : (amount / potentialAmount) * 100;

      promises.push(
        unwrap(
          this.orgRepo.updateAllOpportunityRenewals({
            input: {
              organizationId: organization.id,
              renewalAdjustedRate: rate,
              renewalLikelihood: organization.renewalSummaryRenewalLikelihood,
            },
          }),
        ),
      );
    });

    await Promise.all(promises);
  }

  public async archiveBulk(organizationIds: string[]) {
    organizationIds.forEach((id) => {
      this.organizationStore.delete(id);
    });

    OrganizationViews.mutateCache((view) => {
      view.data = view.data.filter((o) => !organizationIds.includes(o.id));
      view.totalElements = view.data.length;
    });

    const [res, err] = await unwrap(
      this.orgRepo.hideOrganizations({ ids: organizationIds }),
    );

    if (err) {
      console.error(
        'OrganizationService.archiveBulk: Failed archiving organizations',
      );
    }

    if (res) {
      OrganizationViews.instance.init();
    }

    return [res, err];
  }
}
