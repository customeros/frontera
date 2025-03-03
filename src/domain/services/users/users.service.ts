import { RootStore } from '@store/root';
import { User } from '@store/Users/User.dto';
import { injectable } from '@infra/container';
import { UserRepository } from '@infra/repositories/user';

import { unwrap } from '@utils/unwrap';

@injectable
export class UsersService {
  private usersRepo = new UserRepository();
  private store = RootStore.getInstance();

  public async updateUser(userId: string, data: Partial<User>) {
    const [res, err] = await unwrap(
      this.usersRepo.updateUser({
        input: {
          id: userId,
          ...data,
        },
      }),
    );

    if (err) {
      console.error(err);

      return;
    }

    if (!res) {
      console.error('No response from update user');

      return;
    }

    this.store.ui.toastSuccess('User updated', 'user-updated');
  }

  public async getCurrentUser() {
    const [res, err] = await unwrap(this.usersRepo.getCurrentUser());

    if (err) {
      console.error(err);

      return;
    }

    return res;
  }
}
