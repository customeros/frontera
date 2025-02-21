import { observable } from 'mobx';
import { RootStore } from '@store/root';
import { CommonService } from '@domain/services/common/common.service';

export class SyncInvoiceToAccountingUsecase {
  private root = RootStore.getInstance();
  private service = new CommonService();

  @observable accessor channel = '';

  constructor(private readonly agentId: string) {}

  public async execute() {}

  public async init() {}
}
