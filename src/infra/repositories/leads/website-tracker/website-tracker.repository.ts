import { Transport } from '@infra/transport';

import GetWebtrackerDocument from './queries/getWebtracker.graphql';
import GetWebtrackersDocument from './queries/getWebtrackers.graphql';
import { GetWebtrackerQuery } from './queries/getWebtracker.generated';
import { GetWebtrackersQuery } from './queries/getWebtrackers.generated';
import CreateWebTrackerDocument from './mutations/createWebtracker.graphql';
import ArchiveWebtrackerDocument from './mutations/archiveWebtracker.graphql';
import { GetWebtrackerQueryVariables } from './queries/getWebtracker.generated';
import { GetWebtrackersQueryVariables } from './queries/getWebtrackers.generated';
import { CreateWebTrackerMutation } from './mutations/createWebtracker.generated';
import { ArchiveWebtrackerMutation } from './mutations/archiveWebtracker.generated';
import { CreateWebTrackerMutationVariables } from './mutations/createWebtracker.generated';
import { ArchiveWebtrackerMutationVariables } from './mutations/archiveWebtracker.generated';

export class WebsiteTrackerRepository {
  private transport = Transport.getInstance('leads');

  private static instance: WebsiteTrackerRepository;

  constructor() {}

  static getInstance(): WebsiteTrackerRepository {
    if (!WebsiteTrackerRepository.instance) {
      WebsiteTrackerRepository.instance = new WebsiteTrackerRepository();
    }

    return WebsiteTrackerRepository.instance;
  }

  async getWebtracker(payload: GetWebtrackerQueryVariables) {
    return this.transport.graphql.request<
      GetWebtrackerQuery,
      GetWebtrackerQueryVariables
    >(GetWebtrackerDocument, payload);
  }

  async getWebtrackers() {
    return this.transport.graphql.request<
      GetWebtrackersQuery,
      GetWebtrackersQueryVariables
    >(GetWebtrackersDocument);
  }

  async addWebtracker(payload: CreateWebTrackerMutationVariables) {
    return this.transport.graphql.request<
      CreateWebTrackerMutation,
      CreateWebTrackerMutationVariables
    >(CreateWebTrackerDocument, payload);
  }

  async archiveWebtracker(payload: ArchiveWebtrackerMutationVariables) {
    return this.transport.graphql.request<
      ArchiveWebtrackerMutation,
      ArchiveWebtrackerMutationVariables
    >(ArchiveWebtrackerDocument, payload);
  }
}
