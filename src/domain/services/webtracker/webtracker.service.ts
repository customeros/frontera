import { WebsiteTrackerRepository } from '@infra/repositories/leads/website-tracker/website-tracker.repository';
import { GetWebtrackerQueryVariables } from '@infra/repositories/leads/website-tracker/queries/getWebtracker.generated';
import { CreateWebTrackerMutationVariables } from '@infra/repositories/leads/website-tracker/mutations/createWebtracker.generated';
import { ArchiveWebtrackerMutationVariables } from '@infra/repositories/leads/website-tracker/mutations/archiveWebtracker.generated';

import { unwrap } from '@utils/unwrap';

export class WebtrackerService {
  private webtrackerRepository = WebsiteTrackerRepository.getInstance();

  constructor() {}

  async getWebtracker(payload: GetWebtrackerQueryVariables) {
    const [res, err] = await unwrap(
      this.webtrackerRepository.getWebtracker(payload),
    );

    if (err) {
      console.error(
        'WebtrackerService.getWebtracker: Failed getting webtracker',
      );
    }

    return res;
  }

  async getWebtrackers() {
    const [res, err] = await unwrap(this.webtrackerRepository.getWebtrackers());

    if (err) {
      console.error(
        'WebtrackerService.getWebtrackers: Failed getting webtrackers',
      );
    }

    return res;
  }

  async addWebtracker(payload: CreateWebTrackerMutationVariables) {
    const [res, err] = await unwrap(
      this.webtrackerRepository.addWebtracker(payload),
    );

    if (err) {
      console.error(
        'WebtrackerService.addWebtracker: Failed adding webtracker',
        err,
      );
    }

    return res;
  }

  async archiveWebtracker(payload: ArchiveWebtrackerMutationVariables) {
    const [res, err] = await unwrap(
      this.webtrackerRepository.archiveWebtracker(payload),
    );

    if (err) {
      console.error(
        'WebtrackerService.archiveWebtracker: Failed archiving webtracker',
      );
    }

    return res;
  }
}
