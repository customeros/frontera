import { Channel } from 'phoenix';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { GroupOperation } from '@store/types';
import { when, runInAction, makeAutoObservable } from 'mobx';
import { TaskRepository } from '@infra/repositories/core/task';
import { GroupStore, makeAutoSyncableGroup } from '@store/group-store';

import {
  Opportunity,
  InternalStage,
  OpportunityCreateInput,
} from '@graphql/types';

import { OpportunityStore } from './Opportunity.store';
import { OpportunitiesService } from './__services__/Opportunities.service';

export class OpportunitiesStore implements GroupStore<Opportunity> {
  version = 0;
  isLoading = false;
  totalElements = 0;
  history: GroupOperation[] = [];
  error: string | null = null;
  channel?: Channel | undefined;
  isBootstrapped: boolean = false;
  value: Map<string, OpportunityStore> = new Map();
  sync = makeAutoSyncableGroup.sync;
  subscribe = makeAutoSyncableGroup.subscribe;
  load = makeAutoSyncableGroup.load<Opportunity>();
  private service: OpportunitiesService;
  private taskRepository = TaskRepository.getInstance();

  constructor(public root: RootStore, public transport: Transport) {
    this.service = OpportunitiesService.getInstance(transport);

    makeAutoObservable(this);
    makeAutoSyncableGroup(this, {
      channelName: 'Opportunities',
      getItemId: (item) => item?.metadata?.id,
      ItemStore: OpportunityStore,
    });

    when(
      () => this.isBootstrapped && this.totalElements > 0,
      async () => {
        await this.bootstrapRest();
      },
    );
  }

  async bootstrap() {
    if (this.isBootstrapped || this.isLoading) return;

    try {
      this.isLoading = true;

      const { opportunities_LinkedToOrganizations } =
        await this.service.getOpportunities({
          pagination: { limit: 1000, page: 1 },
        });

      this.load(opportunities_LinkedToOrganizations?.content as Opportunity[]);
      runInAction(() => {
        this.isBootstrapped = true;
        this.totalElements = opportunities_LinkedToOrganizations.totalElements;
      });
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error)?.message;
      });
      throw e;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async bootstrapRest() {
    let page = 1;

    while (this.totalElements > this.value.size) {
      try {
        const { opportunities_LinkedToOrganizations } =
          await this.service.getOpportunities({
            pagination: { limit: 1000, page },
          });

        runInAction(() => {
          page++;
          this.load(
            opportunities_LinkedToOrganizations?.content as Opportunity[],
          );
        });
      } catch (e) {
        runInAction(() => {
          this.error = (e as Error)?.message;
        });
        break;
      }
    }
  }

  toArray() {
    return Array.from(this.value.values());
  }

  toComputedArray(compute: (arr: OpportunityStore[]) => OpportunityStore[]) {
    const arr = this.toArray();

    return compute(arr);
  }

  async create(payload: Partial<Opportunity> = {}) {
    const draft = new OpportunityStore(this.root, this.transport);

    Object.assign(draft.value, payload);

    const tempId = draft.value.metadata.id;

    let serverId = '';

    this.value.set(tempId, draft);

    if (!payload.id) return;

    try {
      this.isLoading = true;

      const { opportunity_Save } = await this.service.saveOpportunity({
        input: {
          name: draft.value.name,
          organizationId: payload.id,
          internalType: draft.value.internalType,
          externalStage: draft.value.externalStage,
        } as OpportunityCreateInput,
      });

      runInAction(() => {
        serverId = opportunity_Save?.metadata.id;

        const store = this.value.get(tempId);

        if (!store) return;

        store.value.metadata.id = serverId;
        this.value.delete(tempId);
        this.value.set(serverId, store);
      });
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error)?.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
      this.sync({
        action: 'APPEND',
        ids: [serverId],
      });

      if (draft.value.taskIds.length > 0) {
        this.taskRepository.saveTask({
          input: {
            id: draft.value.taskIds[0],
            opportunityIds: [serverId],
          },
        });
        this.root.tasks
          .getById(draft.value.taskIds[0])
          ?.value.opportunityIds.push(serverId);
      }
      this.value.get(serverId)?.invalidate();

      this.root.ui.toastSuccess(
        `Opportunity created for ${payload.organization?.name}`,
        'create-opportunity-success',
      );
    }
  }

  async archive(id: string) {
    this.value.delete(id);

    try {
      this.isLoading = true;
      await this.service.archiveOpportunity({
        id,
      });
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error)?.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });

      this.sync({ action: 'DELETE', ids: [id] });
      this.root.ui.toastSuccess('Opportunity archived', 'archive-opportunity');
    }
  }

  async archiveMany(ids: string[]) {
    ids.forEach((id) => {
      this.archive(id);
    });
  }

  updateStage = (ids: string[], value: InternalStage | string) => {
    ids.forEach((id) => {
      this.value.get(id)?.update(
        (opp) => {
          if (
            [InternalStage.ClosedLost, InternalStage.ClosedWon].includes(
              value as InternalStage,
            )
          ) {
            opp.internalStage = value as InternalStage;

            return opp;
          }
          opp.internalStage = InternalStage.Open;
          opp.externalStage = value;

          return opp;
        },
        { mutate: true },
      );
    });
  };
}
