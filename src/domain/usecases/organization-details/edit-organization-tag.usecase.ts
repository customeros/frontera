import { RootStore } from '@store/root';
import { Organization } from '@/domain/entities';
import { action, computed, reaction, observable } from 'mobx';
import { TagService, OrganizationService } from '@domain/services';

import { EntityType } from '@graphql/types';
import { SelectOption } from '@ui/utils/types.ts';

export class EditOrganizationTagUsecase {
  @observable public accessor searchTerm = '';
  @observable private accessor newTags = new Set();
  @observable public accessor initialTags: { label: string; value: string }[] =
    [];

  private root = RootStore.getInstance();
  private tagService = new TagService();
  private organizationService = new OrganizationService();

  constructor(private organization: Organization) {
    reaction(
      () =>
        this.newTags.size ||
        this.root.tags.getByEntityType(EntityType.Organization).length,

      this.computeInitialTags,
    );
    this.computeInitialTags();
  }

  @computed
  get orgTags() {
    return new Set((this.organization?.tags ?? []).map((tag) => tag.name));
  }

  @computed
  get selectedTags() {
    return (
      this.organization?.tags.map((tag) => {
        const matchedTag = this.root.tags.getById(tag.metadata.id);

        return {
          label: matchedTag?.value.name ?? tag.name,
          value: tag.metadata.id,
        } as SelectOption;
      }) ?? []
    );
  }

  @action
  private computeInitialTags = () => {
    this.initialTags = this.root.tags
      .getByEntityType(EntityType.Organization)
      .filter((e) => !!e.value.name)
      .sort((a, b) => {
        const aInOrg = this.orgTags.has(a.value.name);
        const bInOrg = this.orgTags.has(b.value.name);

        if (aInOrg && !bInOrg) return -1;
        if (!aInOrg && bInOrg) return 1;

        return 0;
      })
      .map((tag) => {
        return {
          value: tag.id,
          label: tag.tagName,
        };
      });
  };

  @computed
  get tagList() {
    const sorted = this.initialTags.slice().sort((a, b) => {
      const aInOrg = this.newTags.has(a.label);
      const bInOrg = this.newTags.has(b.label);

      if (aInOrg && !bInOrg) return -1;
      if (!aInOrg && bInOrg) return 1;

      return 0;
    });

    return sorted.filter((tag) =>
      tag.label.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

  @action
  setSearchTerm = (searchTerm: string) => {
    this.searchTerm = searchTerm;
  };

  @action
  reset = () => {
    this.setSearchTerm('');
    this.newTags.clear();
  };

  @action
  close = () => {
    this.reset();
    this.root.ui.commandMenu.setOpen(false);
  };

  @action
  select = (ids?: string[]) => {
    if (!ids || !this.organization) {
      console.error(
        'EditOrganizationTagUsecase: select called without id or company',
      );

      return;
    }

    const organization = this.organization;
    const tags = ids.map((e) => this.root.tags.getById(e)).filter(Boolean);
    const currentTags = organization.tags;

    const tagsToAdd = tags.filter(
      (tag) =>
        !currentTags.some((currentTag) => currentTag.metadata.id === tag!.id),
    );

    const tagsToRemove = currentTags
      .filter(
        (currentTag) => !tags.some((tag) => tag!.id === currentTag.metadata.id),
      )
      .map((tagDatum) => this.root.tags.getById(tagDatum.metadata.id))
      .filter(Boolean);

    tagsToAdd.forEach((tag) => {
      this.organizationService.addTag(organization, tag!);
    });

    tagsToRemove.forEach((tag) => {
      this.newTags.delete(tag!.value.name);
      this.organizationService.removeTag(organization, tag!);
    });
  };

  @action
  create = () => {
    const name = this.searchTerm;

    if (!this.organization) return;

    this.tagService.createTag(
      { name, entityType: EntityType.Organization },
      {
        onSuccess: (id) => {
          this.newTags.add(name);
          this.setSearchTerm('');

          const currentTagIds = this.organization?.tags.map(
            (tag) => tag.metadata.id,
          );

          this.select([...currentTagIds!, id]);
        },
      },
    );
  };
}
