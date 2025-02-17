import { Channel } from 'phoenix';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { GroupOperation } from '@store/types';
import { FlowStore } from '@store/Flows/Flow.store';
import { FlowService } from '@store/Flows/__service__';
import { runInAction, makeAutoObservable } from 'mobx';
import { GroupStore, makeAutoSyncableGroup } from '@store/group-store';

import { Flow, FlowStatus } from '@graphql/types';

export class FlowsStore implements GroupStore<Flow> {
  version = 0;
  isLoading = false;
  history: GroupOperation[] = [];
  error: string | null = null;
  channel?: Channel | undefined;
  isBootstrapped: boolean = false;
  value: Map<string, FlowStore> = new Map();
  sync = makeAutoSyncableGroup.sync;
  subscribe = makeAutoSyncableGroup.subscribe;
  load = makeAutoSyncableGroup.load<Flow>();
  totalElements = 0;
  private service: FlowService;

  constructor(public root: RootStore, public transport: Transport) {
    makeAutoObservable(this);
    makeAutoSyncableGroup(this, {
      channelName: 'Flows',
      getItemId: (item) => item?.metadata?.id,
      ItemStore: FlowStore,
    });
    this.service = FlowService.getInstance(transport);
  }

  toArray() {
    return Array.from(this.value.values());
  }

  toComputedArray(compute: (arr: FlowStore[]) => FlowStore[]) {
    const arr = this.toArray().filter(
      (item) => item.value.status !== FlowStatus.Archived,
    );

    return compute(arr as FlowStore[]);
  }

  async bootstrap() {
    if (this.root.demoMode) {
      this.isBootstrapped = true;

      return;
    }

    if (this.isBootstrapped || this.isLoading) return;

    try {
      const { flows } = await this.service.getFlows();

      runInAction(() => {
        this.load(flows);
      });
      runInAction(() => {
        this.isBootstrapped = true;
        this.totalElements = flows.length;
      });
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error)?.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async invalidate() {
    this.isLoading = true;

    try {
      const { flows } = await this.service.getFlows();

      runInAction(() => {
        this.load(flows);
      });
      runInAction(() => {
        this.isBootstrapped = true;
        this.totalElements = flows.length;
      });
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error)?.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async invalidateId({ id }: { id: string }) {
    this.isLoading = true;

    try {
      const { flow } = await this.service.getFlow(id);

      runInAction(() => {
        this.load([flow]);
      });
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error)?.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async create(
    name: string,
    options?: { onSuccess?: (serverId: string) => void },
  ) {
    this.isLoading = true;

    const newFlow = new FlowStore(this.root, this.transport);
    const tempId = newFlow.value.metadata.id;

    newFlow.value = {
      ...newFlow.value,
      name,
    };

    let serverId: string | undefined;

    this.value.set(tempId, newFlow);

    try {
      const { flow_Merge } = await this.service.mergeFlow({
        input: {
          name,
          nodes: newFlow.value.nodes,
          edges: newFlow.value.edges,
        },
      });

      runInAction(() => {
        serverId = flow_Merge?.metadata.id;

        if (serverId) {
          newFlow.setId(serverId);
          newFlow.value = {
            ...newFlow.value,
            nodes: flow_Merge.nodes,
            edges: flow_Merge.edges,
          };
          this.value.set(serverId, newFlow);
        }

        this.value.delete(tempId);

        this.sync({ action: 'APPEND', ids: [serverId] });
        serverId && options?.onSuccess?.(serverId);
        setTimeout(() => {
          if (serverId) {
            this.root.flows.bootstrap();
            this.sync({
              action: 'APPEND',
              ids: [serverId],
            });
          }
        }, 1000);
      });
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error)?.message;
        this.value.delete(tempId);
      });
    } finally {
      this.isLoading = false;
    }
  }

  async duplicate(
    name: string,
    id: string,
    options?: { onSuccess?: (serverId: string) => void },
  ) {
    const originFlow = this.value.get(id);
    const newFlow = new FlowStore(this.root, this.transport);
    const tempId = newFlow.value.metadata.id;

    if (!originFlow) {
      throw new Error('Origin flow not found');
    }

    newFlow.value = {
      ...newFlow.value,
      nodes: originFlow.value.nodes,
      edges: originFlow.value.edges,
      name,
    };

    let serverId: string | undefined;

    this.value.set(tempId, newFlow);

    try {
      const { flow_Merge } = await this.service.mergeFlow({
        input: {
          name,
          nodes: newFlow.value.nodes,
          edges: newFlow.value.edges,
        },
      });

      runInAction(() => {
        serverId = flow_Merge?.metadata.id;

        if (serverId) {
          newFlow.setId(serverId);
          newFlow.value = {
            ...newFlow.value,
            nodes: flow_Merge.nodes,
            edges: flow_Merge.edges,
          };
          this.value.set(serverId, newFlow);
        }
        this.value.delete(tempId);

        this.sync({ action: 'APPEND', ids: [serverId] });
        serverId && options?.onSuccess?.(serverId);
        setTimeout(() => {
          if (serverId) {
            this.root.flows.bootstrap();
            this.sync({
              action: 'APPEND',
              ids: [serverId],
            });
          }
        }, 1000);
      });
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error)?.message;
        this.value.delete(tempId);
      });
    }
  }

  archive = async (id: string, options?: { onSuccess?: () => void }) => {
    this.isLoading = true;

    const flow = this.value.get(id);

    try {
      const { flow_Archive } = await this.service.archiveFlow({
        id,
      });

      if (flow_Archive.result) {
        runInAction(() => {
          flow?.update(
            (seq) => {
              seq.status = FlowStatus.Archived;

              return seq;
            },
            { mutate: false },
          );

          const contactParticipantIds = (flow?.value.participants ?? [])
            .filter((participant) => participant.entityType === 'CONTACT')
            .map((participant) => participant.entityId);

          contactParticipantIds.forEach((contactId) => {
            const contact = this.root.contacts.value.get(contactId);

            contact?.invalidate();
          });

          this.root.contacts.sync({
            action: 'INVALIDATE',
            ids: contactParticipantIds,
          });

          this.sync({
            action: 'DELETE',
            ids: [id],
          });
        });
        this.root.ui.toastSuccess(`Flow archived`, 'archive-flow-success');
      }
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error).message;
        this.root.ui.toastError(
          `We couldn't archive this flow`,
          'archive-view-error',
        );
      });
    } finally {
      this.isLoading = false;
      options?.onSuccess?.();
    }
  };

  // todo update with proper bulk mutation when BE is ready
  archiveMany = async (ids: string[], options?: { onSuccess?: () => void }) => {
    this.isLoading = true;

    try {
      await this.service.archiveFlowBulk({
        ids,
      }),
        runInAction(() => {
          this.sync({ action: 'DELETE', ids: ids });
          ids.forEach((id) => this.value.delete(id)),
            this.root.ui.toastSuccess(
              `${ids.length} flows archived`,
              'archive-flows-success',
            );
          options?.onSuccess?.();
        });
    } catch (err) {
      this.error = (err as Error).message;
      this.root.ui.toastError(
        "We couldn't archive these flows",
        'archive-flows-error',
      );
    } finally {
      this.isLoading = false;
    }
  };
}
