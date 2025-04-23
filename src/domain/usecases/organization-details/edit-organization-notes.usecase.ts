import { htmlToText } from 'html-to-text';
import { Organization } from '@/domain/entities';
import { action, computed, observable } from 'mobx';
import { OrganizationService } from '@domain/services';

export class EditOrganizationNotesUsecase {
  @observable public accessor note = '';

  private organizationService = new OrganizationService();

  constructor(private organization: Organization) {}

  @computed
  get defaultNote() {
    return htmlToText(this.organization?.notes ?? '').trim();
  }

  @action
  setNotes = (newNote: string) => {
    this.note = newNote;
  };

  @action
  execute = () => {
    if (!this.organization) {
      console.error(
        'EditOrganizationNoteUsecase: execute called without company',
      );

      return;
    }

    if (this.note !== this.organization.notes) {
      this.organizationService.setNotes(this.organization, this.note);
    }
  };
}
