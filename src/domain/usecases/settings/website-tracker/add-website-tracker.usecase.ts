import { action, observable } from 'mobx';
import { webtrackConfigStore } from '@domain/stores/settings.store';
import { WebtrackerService } from '@domain/services/webtracker/webtracker.service';
export class AddWebsiteTrackerUseCase {
  private webtrackerService = new WebtrackerService();
  @observable public accessor isModalOpen = false;
  @observable public accessor website = '';
  private webtrackStore: typeof webtrackConfigStore;

  constructor(webtrackStore: typeof webtrackConfigStore) {
    this.webtrackStore = webtrackStore;
    this.toogleModal = this.toogleModal.bind(this);
    this.setWebsite = this.setWebsite.bind(this);
    this.execute = this.execute.bind(this);
  }

  @action
  public toogleModal = () => {
    this.isModalOpen = !this.isModalOpen;
  };

  @action
  public setWebsite = (website: string) => {
    this.website = website;
  };

  async execute() {
    const res = await this.webtrackerService.addWebtracker({
      tracker: {
        domain: this.website,
      },
    });

    if (res?.createWebtracker) {
      this.webtrackStore.getOrFetch(res.createWebtracker.id);
    }
  }

  @action
  public reset = () => {
    this.website = '';
    this.isModalOpen = false;
  };
}
