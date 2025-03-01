import { RootStore } from '@store/root';
import { htmlToText } from 'html-to-text';
import { action, computed, observable } from 'mobx';
import { OrganizationService } from '@domain/services';

export class EditOrganizationNotesUsecase {
  @observable public accessor note = '';

  private root = RootStore.getInstance();
  private organizationService = new OrganizationService();
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
    this.setNotes = this.setNotes.bind(this);
  }

  @computed
  get organization() {
    if (!this.organizationId) return;

    return this.root.organizations.getById(this.organizationId);
  }

  @computed
  get defaultNote() {
    return htmlToText(this.organization?.value?.notes ?? '').trim();
  }

  @action
  public setNotes(newNote: string) {
    this.note = newNote;
  }

  @action
  public execute() {
    const organization = this.organization;

    if (!organization) {
      console.error(
        'EditOrganizationNoteUsecase: execute called without company',
      );

      return;
    }

    if (this.note !== organization.value?.notes) {
      this.organizationService.updateNotes(organization, this.note);
    }
  }
}
