import merge from 'lodash/merge';
import { Channel } from 'phoenix';
import { gql } from 'graphql-request';
import { Store } from '@store/store.ts';
import { RootStore } from '@store/root.ts';
import { Transport } from '@infra/transport.ts';
import { GroupOperation } from '@store/types.ts';
import { registry } from '@domain/stores/registry';
import { when, runInAction, makeAutoObservable } from 'mobx';
import { UtilService } from '@domain/services/util/util.service';
import { ContractService } from '@store/Contracts/Contract.service.ts';
import { GroupStore, makeAutoSyncableGroup } from '@store/group-store.ts';

import { Contract, ContractInput } from '@graphql/types';

import { ContractStore } from './Contract.store';

export class ContractsStore implements GroupStore<Contract> {
  version = 0;
  isLoading = false;
  isPending: Map<string, string> = new Map();
  history: GroupOperation[] = [];
  error: string | null = null;
  channel?: Channel | undefined;
  isBootstrapped: boolean = false;
  value: Map<string, Store<Contract>> = new Map();
  organizationId: string = '';
  sync = makeAutoSyncableGroup.sync;
  subscribe = makeAutoSyncableGroup.subscribe;
  load = makeAutoSyncableGroup.load<Contract>();
  totalElements = 0;
  private service: ContractService;
  private utilService: UtilService;
  private organizationStore = registry.get('organizations');

  constructor(public root: RootStore, public transport: Transport) {
    this.service = new ContractService(transport);
    this.utilService = new UtilService();
    makeAutoSyncableGroup(this, {
      channelName: 'Contracts',
      getItemId: (item: Contract) => item?.metadata?.id,
      ItemStore: ContractStore,
    });
    makeAutoObservable(this);
    when(
      () => this.isBootstrapped && this.totalElements > 0,
      async () => {
        await this.bootstrapRest();
      },
    );
  }

  toArray() {
    return Array.from(this.value.values()) as ContractStore[];
  }

  toComputedArray(compute: (arr: ContractStore[]) => ContractStore[]) {
    const arr = this.toArray();

    return compute(arr);
  }

  async bootstrap() {
    if (this.isBootstrapped || this.isLoading) return;

    try {
      this.isLoading = true;

      const { contracts } = await this.service.getContracts({
        pagination: { limit: 1000, page: 0 },
      });

      this.load(contracts.content);
      runInAction(() => {
        this.isBootstrapped = true;
        this.totalElements = contracts.totalElements;
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
        this.isLoading = true;

        const { contracts } = await this.service.getContracts({
          pagination: { limit: 100, page },
        });

        runInAction(() => {
          page++;
          this.load(contracts.content);
        });
      } catch (e) {
        runInAction(() => {
          this.error = (e as Error)?.message;
        });
        break;
      }
    }
  }

  async invalidate() {
    try {
      this.isLoading = true;

      const { contracts } = await this.service.getContracts({
        pagination: { limit: 1000, page: 0 },
      });

      this.totalElements = contracts.totalElements;

      this.load(contracts.content);
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error)?.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  create = async (payload: ContractInput) => {
    this.isPending.set(payload.organizationId, payload.organizationId);

    const newContract = new ContractStore(this.root, this.transport);
    const tempId = newContract.value.metadata.id;
    const { name, organizationId, ...rest } = payload;

    let serverId = '';

    if (payload) {
      merge(newContract.value, {
        contractName: name,
        ...rest,
      });
    }

    this.value.set(tempId, newContract);

    const record = this.organizationStore.get(payload.organizationId);

    if (!record) {
      console.error(
        `Organization with id=${payload.organizationId} was not found`,
      );
    }

    record?.addContract(tempId);

    try {
      const { contract_Create } = await this.service.createContract({
        input: { ...payload },
      });

      runInAction(() => {
        serverId = contract_Create.metadata.id;

        newContract.value.metadata.id = serverId;

        this.value.set(serverId, newContract);
        this.value.delete(tempId);

        record?.deleteContract(tempId);
        record?.addContract(serverId);

        this.sync({ action: 'APPEND', ids: [serverId] });
      });
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error).message;
      });
    } finally {
      this.isPending.delete(payload.organizationId);

      if (serverId) {
        newContract.value.billingDetails = {
          ...newContract.value.billingDetails,
          organizationLegalName: this.organizationStore.get(
            payload.organizationId,
          )?.name,
        };

        setTimeout(() => {
          runInAction(() => {
            this.organizationStore.revalidate(organizationId);

            (this.value.get(serverId) as ContractStore)?.updateBillingAddress();
          });
        }, 500);
      }
    }
  };

  delete = async (contractId: string, organizationId: string) => {
    const contract = this.value.get(contractId);

    if (!contract) return;

    if (contract.value.upcomingInvoices.length > 0) {
      this.utilService.toastError(`Contracts with invoices can’t be archived`);

      return;
    }
    const record = this.organizationStore.get(organizationId);

    record?.deleteContract(contractId);

    this.value.delete(contractId);

    try {
      this.isLoading = true;
      await this.transport.graphql.request<unknown, CONTRACT_DELETE_PAYLOAD>(
        DELETE_CONTRACT,
        { id: contractId },
      );
      runInAction(() => {
        this.sync({ action: 'DELETE', ids: [contractId] });
        this.sync({ action: 'INVALIDATE', ids: [contractId] });
      });
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error)?.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
}

type CONTRACT_DELETE_PAYLOAD = { id: string };
const DELETE_CONTRACT = gql`
  mutation deleteContract($id: ID!) {
    contract_Delete(id: $id) {
      accepted
      completed
    }
  }
`;
