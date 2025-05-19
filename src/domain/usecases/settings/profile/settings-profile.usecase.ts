import { RootStore } from '@store/root';
import { injectable } from '@infra/container';
import { action, computed, observable } from 'mobx';
import { UsersService } from '@domain/services/users/users.service';

@injectable
export class SettingsProfileUseCase {
  private usersService = new UsersService();
  private root = RootStore.getInstance();
  @observable public accessor userId: string = '';

  constructor(userId: string) {
    this.updateUserName = this.updateUserName.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateUserProfilePhotoUrl = this.updateUserProfilePhotoUrl.bind(this);
    this.userId = userId;
  }

  @computed
  get userName() {
    return this.root.users.getById(this.userId)?.value.name;
  }

  @computed
  get userProfilePhotoUrl() {
    return this.root.users.getById(this.userId)?.value.profilePhotoUrlV2;
  }

  @action
  public updateUserName(name: string) {
    this.root.users.getById(this.userId)?.updateName(name);
  }

  @action
  public updateUserProfilePhotoUrl(url: string) {
    this.root.users.getById(this.userId)?.updateProfilePhotoUrl(url);
  }

  public async updateUser() {
    const user = this.root.users.getById(this.userId);

    if (!user) return;

    await this.usersService.updateUser(user.id, {
      name: user.name,
      profilePhotoUrl: user.value.profilePhotoUrl,
    });
  }
}
