import { action, observable } from 'mobx';
import { WebtrackConfig } from '@domain/entities/webtrackConfig.entity';
import { WebtrackerService } from '@domain/services/webtracker/webtracker.service';

export class DomainCardActionsUsecase {
  private webtrackerService = new WebtrackerService();
  @observable accessor isCollapsed = false;
  @observable accessor isInfoOpen = false;
  @observable accessor isConfirmDeleteOpen = false;
  constructor(private webtrackerEntity: WebtrackConfig) {
    this.archive = this.archive.bind(this);
    this.toggleInfo = this.toggleInfo.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.toggleConfirmDelete = this.toggleConfirmDelete.bind(this);
  }

  @action
  public async archive() {
    const res = await this.webtrackerService.archiveWebtracker({
      id: this.webtrackerEntity.id,
    });

    if (res) {
      this.webtrackerEntity.archive();
    }
  }

  @action
  public toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  @action
  public toggleConfirmDelete() {
    this.isConfirmDeleteOpen = !this.isConfirmDeleteOpen;
  }

  @action
  public toggleInfo() {
    this.isInfoOpen = !this.isInfoOpen;
  }
}
