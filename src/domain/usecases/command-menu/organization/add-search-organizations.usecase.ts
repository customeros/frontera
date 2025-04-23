import { match } from 'ts-pattern';
import { RootStore } from '@/store/root';
import { Organization } from '@/domain/entities';
import { registry } from '@/domain/stores/registry';
import { OrganizationService } from '@/domain/services';
import { when, action, reaction, computed, observable } from 'mobx';
import { SearchGlobalOrganizationsQuery } from '@/infra/repositories/core/organization/queries/searchGlobalOrganizations.generated';

import { validateUrl } from '@utils/url';
import { OrganizationStage, OrganizationRelationship } from '@graphql/types';

type GlobalOrganization =
  SearchGlobalOrganizationsQuery['globalOrganizations_Search'][number];

type Status =
  | 'LOADING'
  | 'ERROR'
  | 'IDLE'
  | 'VALIDATING_DOMAIN'
  | 'ADDING_ORGANIZATION';

export class AddSearchOrganizationsUsecase {
  private root = RootStore.getInstance();
  private organizationStore = registry.get('organizations');
  private organizationService = new OrganizationService();
  @observable private accessor searchedIds: string[] = [];

  @observable accessor searchTerm = '';
  @observable accessor errorMessage = '';
  @observable accessor status: Status = 'IDLE';
  @observable accessor addingOrganizationId = '';
  @observable accessor domainValidationError = '';
  @observable accessor domainValidationMessage = '';
  @observable accessor options: AddSearchOrganizationOption[] = [];

  constructor() {
    this.execute = this.execute.bind(this);
    this.setSearchTerm = this.setSearchTerm.bind(this);
    this.searchGlobal = this.searchGlobal.bind(this);

    // get first 30 global suggestions on mount
    when(() => !!this.root.session.sessionToken, this.searchGlobal);
    reaction(() => this.searchTerm, this.execute);
  }

  @computed
  get isLoading() {
    return this.status === 'LOADING';
  }

  @computed
  get isValidatingDomain() {
    return this.status === 'VALIDATING_DOMAIN';
  }

  @computed
  get isAddingOrganization() {
    return this.status === 'ADDING_ORGANIZATION';
  }

  @computed
  get mixedOptions() {
    const tenantOrgs = this.searchedIds.reduce((acc, id) => {
      const entity = this.organizationStore.get(id);

      if (entity) {
        acc.push(new AddSearchOrganizationOption(entity));
      }

      return acc;
    }, [] as AddSearchOrganizationOption[]);

    if (!this.searchTerm) {
      return this.options;
    }

    return [...tenantOrgs, ...this.options];
  }

  @action
  public setSearchTerm(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  @action
  private loading() {
    this.status = 'LOADING';
  }

  @action
  private idle() {
    this.status = 'IDLE';
  }

  @action
  private error(error: string) {
    this.status = 'ERROR';
    this.errorMessage = error;
  }

  @action
  private validatingDomain() {
    this.status = 'VALIDATING_DOMAIN';
  }

  @action
  private addingOrganization(id: string) {
    this.addingOrganizationId = id;
    this.status = 'ADDING_ORGANIZATION';
  }

  @action
  private domainError(error: string) {
    this.status = 'IDLE';
    this.domainValidationError = error;
  }

  @action
  private domainMessage(message: string) {
    this.status = 'IDLE';
    this.domainValidationMessage = message;
  }

  @action
  private setOptions(options: AddSearchOrganizationOption[]) {
    this.options = options.filter((o) => !o.tenantOrganizationId);
  }

  @action
  private setSearchedIds(ids: string[]) {
    this.searchedIds = ids;
  }

  @action
  public reset() {
    this.searchTerm = '';
    this.errorMessage = '';
    this.status = 'IDLE';
    this.searchedIds = [];
    this.addingOrganizationId = '';
    this.domainValidationError = '';
    this.domainValidationMessage = '';
  }

  private async searchGlobal() {
    this.loading();

    const [res, err] = await this.organizationService.searchGlobal(
      this.searchTerm,
      30,
    );

    if (err) {
      console.error(
        'AddSearchOrganizationsUsecase.searchGlobal: Failed searching global organizations',
      );

      this.error('Could not search companies');

      return;
    }

    if (res) {
      this.setOptions(
        res.globalOrganizations_Search.map(
          (data) => new AddSearchOrganizationOption(data),
        ) ?? [],
      );
      this.idle();
    }
  }

  private async searchTenant() {
    this.loading();

    const [res, err] = await this.organizationService.searchTenant(
      this.searchTerm,
    );

    if (err) {
      console.error(
        'AddSearchOrganizationsUsecase.searchTenant: Failed searching tenant organizations',
      );
    }

    const results = res?.ui_organizations_search?.ids ?? [];

    if (results.length === 0) {
      this.idle();
      this.setSearchedIds([]);

      return;
    }

    this.setSearchedIds(results);
    this.idle();
  }

  private async validateDomain() {
    this.validatingDomain();

    const [res, err] = await this.organizationService.validateDomain(
      this.searchTerm,
    );

    if (err) {
      this.error('Could not check website');

      return;
    }

    if (!res) {
      return;
    }

    const result = res.organization_CheckWebsite;
    const isAccepted = result.accepted ?? false;
    const isPrimary = result.primary ?? false;
    const foundPrimaryDomain = result.primaryDomain;
    const foundGlobalOrganization = result.globalOrganization;

    if (!isAccepted) {
      this.domainError(`We don't allow hosting or profile-based domains`);

      return;
    }

    if (!isPrimary && foundPrimaryDomain) {
      if (foundGlobalOrganization) {
        if (foundGlobalOrganization?.organizationId) {
          this.organizationStore.getOrFetch(
            foundGlobalOrganization.organizationId,
          );

          this.searchedIds.push(foundGlobalOrganization.organizationId);
        } else {
          this.setOptions([
            new AddSearchOrganizationOption(foundGlobalOrganization),
          ]);
        }
      }
      this.domainMessage(`This domain is linked to ${foundPrimaryDomain}`);

      return;
    }

    this.domainError('');
    this.domainMessage('');
  }

  private getCurrentViewDef() {
    const searchParams = new URLSearchParams(window.location.search);
    const preset = searchParams.get('preset');

    if (!preset) return;

    return this.root.tableViewDefs.getById(preset);
  }

  private getViewDefDefaults() {
    const viewDef = this.getCurrentViewDef();

    if (!viewDef) return {};

    return match(viewDef.getDefaultFilters())
      .with(null, () => ({}))
      .with({ AND: [] }, () => ({}))
      .with(
        {
          AND: [
            {
              filter: {
                property: 'ORGANIZATIONS_RELATIONSHIP',
                value: ['CUSTOMER'],
              },
            },
          ],
        },
        () => ({
          relationship: OrganizationRelationship.Customer,
          stage: OrganizationStage.Onboarding,
        }),
      )
      .with(
        {
          AND: [
            {
              filter: {
                property: 'ORGANIZATIONS_STAGE',
                value: ['TARGET'],
              },
            },
            {
              filter: {
                property: 'ORGANIZATIONS_RELATIONSHIP',
                value: ['PROSPECT'],
              },
            },
          ],
        },
        () => ({
          relationship: OrganizationRelationship.Prospect,
          stage: OrganizationStage.Target,
        }),
      )
      .otherwise(() => ({}));
  }

  public async addNewOrganization(option?: AddSearchOrganizationOption) {
    if (!option) {
      const isUrl = validateUrl(this.searchTerm);

      const organization = new Organization({
        ...this.getViewDefDefaults(),
        name: isUrl ? undefined : this.searchTerm || 'Unnamed',
        website: !isUrl ? undefined : this.searchTerm || '',
      });

      await this.organizationService.create(organization);
    }

    if (option?.source !== 'global') {
      this.root.ui.commandMenu.toggle('AddNewOrganization');
      this.reset();
      this.searchGlobal();

      return;
    }

    if (option) {
      const { id: globalId, ...rest } = option;

      this.addingOrganization(globalId);

      await this.organizationService.import(
        globalId,
        new Organization({
          ...this.getViewDefDefaults(),
          ...rest,
        }),
      );

      this.searchGlobal();
    }

    this.root.ui.commandMenu.toggle('AddNewOrganization');
    this.reset();
  }

  public async execute() {
    if (this.searchTerm.length === 0) {
      this.setSearchedIds([]);
      this.domainError('');
      this.domainMessage('');
    }

    const isValidUrl = validateUrl(this.searchTerm);

    // fetch global and tenant organizations
    await Promise.all([this.searchGlobal(), this.searchTenant()]);

    if (isValidUrl) {
      // if term is a valid URL, validate and check domain
      await this.validateDomain();
    }
  }
}

class AddSearchOrganizationOption {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  iconUrl: string | null;
  tenantOrganizationId: string;
  source: 'global' | 'tenant' = 'global';

  constructor(data: GlobalOrganization | Organization) {
    if (data instanceof Organization) {
      this.id = data.id;
      this.name = data.name;
      this.source = 'tenant';
      this.website = data.website ?? null;
      this.logoUrl = data.logoUrl ?? null;
      this.iconUrl = data.iconUrl ?? null;
      this.tenantOrganizationId = data.id;
    } else {
      this.id = data.id;
      this.name = data.name;
      this.source = 'global';
      this.website = data.website ?? null;
      this.logoUrl = data.logoUrl ?? null;
      this.iconUrl = data.iconUrl ?? null;
      this.tenantOrganizationId = data.organizationId ?? '';
    }
  }
}
