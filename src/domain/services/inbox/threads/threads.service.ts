import { ThreadsRepository } from '@infra/repositories/mailstack/Threads/threads.repository';
import { GetInboxQueryQueryVariables } from '@infra/repositories/mailstack/Threads/query/getInbox.generated';

import { unwrap } from '@utils/unwrap';

export class ThreadsService {
  private threadsRepository = ThreadsRepository.getInstance();

  public async getThreads(payload: GetInboxQueryQueryVariables) {
    const [res, err] = await unwrap(this.threadsRepository.getThreads(payload));

    if (err) {
      throw err;
    }

    if (res) {
      return res;
    }
  }
}
