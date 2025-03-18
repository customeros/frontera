import { runInAction } from 'mobx';
import { Store } from '@store/_store';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { User, UserDatum } from '@store/Users/User.dto';
import { UserRepository } from '@infra/repositories/core/user/user.repository';

export class UsersStore extends Store<UserDatum, User> {
  private repository = UserRepository.getInstance();

  constructor(public root: RootStore, public transport: Transport) {
    super(root, transport, {
      name: 'Users',
      getId: (data) => data?.id,
      factory: User,
    });
  }

  get tenantUsers() {
    return this.toComputedArray((users) =>
      users.filter(
        (user) =>
          !user.value.bot &&
          !user.value.test &&
          !user.value.internal &&
          user.value.name,
      ),
    );
  }

  get usersWithoutBotsAndInternal() {
    return this.toComputedArray((users) =>
      users.filter((user) => !user.value.bot && !user.value.internal),
    );
  }

  async bootstrap() {
    if (this.isBootstrapped || this.isLoading) return;

    try {
      this.isLoading = true;

      const { users } = await this.repository.getUsers({
        pagination: {
          limit: 1000,
          page: 0,
        },
      });

      runInAction(() => {
        users.content.forEach((user) => {
          const foundUser = this.value.get(user.id);

          if (foundUser) {
            Object.assign(foundUser.value, user);
          } else {
            this.value.set(user.id, new User(this, user));
          }
        });

        this.isBootstrapped = true;
        this.totalElements = users.totalElements;
      });
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error)?.message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async getCurrentUser() {
    try {
      const { user_Current } = await this.repository.getCurrentUser();

      runInAction(() => {
        this.root.session.value.profile.id = user_Current.id;
      });
    } catch (error) {
      console.error('Failed to get current user:', error);

      return null;
    }
  }
}
