import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { inject } from '@infra/container';
import { Agent } from '@store/Agents/Agent.dto';
import { action, computed, observable } from 'mobx';
import { AgentService } from '@domain/services/agent/agent.service';
import { CommonService } from '@domain/services/common/common.service';

import { CapabilityType } from '@graphql/types';

type AccountingMethod = 'cash' | 'accrual';

export class SyncInvoiceToAccountingUsecase {
  @inject(AgentService) private agentService!: AgentService;
  @inject(CommonService) private commonService!: CommonService;

  private store = RootStore.getInstance();

  @observable accessor isEnabled = false;
  @observable accessor isConnecting = false;
  @observable accessor isRevokeOpen = false;
  @observable accessor isRevoking = false;
  @observable accessor isAccountingMethodInfoOpen = false;
  @observable accessor accountingMethod: AccountingMethod = 'cash';

  constructor(private agentId: string) {
    this.init = this.init.bind(this);
    this.execute = this.execute.bind(this);
    this.dispose = this.dispose.bind(this);
    this.toggleEnabled = this.toggleEnabled.bind(this);
    this.toggleRevokeOpen = this.toggleRevokeOpen.bind(this);
    this.toggleAccountingMethod = this.toggleAccountingMethod.bind(this);
    this.toggleAccountingMethodInfo =
      this.toggleAccountingMethodInfo.bind(this);
  }

  @computed
  get agent() {
    return this.store.agents.getById(this.agentId);
  }

  @computed
  private get capability() {
    return this.agent?.getCapability(CapabilityType.SyncInvoiceToAccounting);
  }

  @computed
  get capabilityName() {
    return this.agent?.getCapabilityName(
      CapabilityType.SyncInvoiceToAccounting,
    );
  }

  @computed
  get isQuickbooksConnected() {
    return this.store.settings.oauthToken.isQuickbooksConnected;
  }

  @action
  public toggleRevokeOpen() {
    const span = Tracer.span(
      'SyncInvoiceToAccountingUsecase.toggleRevokeOpen',
      {
        isRevokeOpen: this.isRevokeOpen,
      },
    );

    this.isRevokeOpen = !this.isRevokeOpen;

    span.end({
      isRevokeOpen: this.isRevokeOpen,
    });
  }

  @action
  public toggleAccountingMethodInfo() {
    this.isAccountingMethodInfoOpen = !this.isAccountingMethodInfoOpen;
  }

  @action
  public toggleConnecting() {
    this.isConnecting = !this.isConnecting;
  }

  @action
  public toggleRevoking() {
    const span = Tracer.span('SyncInvoiceToAccountingUsecase.toggleRevoking', {
      isRevoking: this.isRevoking,
    });

    this.isRevoking = !this.isRevoking;

    span.end({
      isRevoking: this.isRevoking,
    });
  }

  @action
  public async toggleEnabled() {
    const span = Tracer.span('SyncInvoiceToAccountingUsecase.toggleEnabled');

    if (this.isQuickbooksConnected) {
      this.isEnabled = !this.isEnabled;

      this.agent?.toggleCapabilityStatus(
        CapabilityType.SyncInvoiceToAccounting,
      );

      const [res, err] = await this.agentService.saveAgent(this.agent!);

      if (err) {
        console.error(
          'SyncInvoiceToAccountingUsecase.toggleEnabled: Error saving agent',
          err,
        );

        span.end();

        return;
      }

      if (res) {
        this.agent?.put(res.agent_Save);
        this.init();
        span.end();
      }
    }

    span.end();
  }

  @action
  public async toggleAccountingMethod() {
    const span = Tracer.span(
      'SyncInvoiceToAccountingUsecase.toggleAccountingMethod',
      {
        accountingMethod: this.accountingMethod,
      },
    );

    this.accountingMethod =
      this.accountingMethod === 'cash' ? 'accrual' : 'cash';

    this.agent?.setCapabilityConfig(
      CapabilityType.SyncInvoiceToAccounting,
      'accountingMethodAccrual',
      this.accountingMethod === 'accrual',
    );

    const [res, err] = await this.agentService.saveAgent(this.agent!);

    if (err) {
      console.error(
        'SyncInvoiceToAccountingUsecase.toggleAccountingMethod: Error saving agent',
        err,
      );
    }

    if (res) {
      this.agent?.put(res.agent_Save);
      this.init();
    }

    span.end({
      accountingMethod: this.accountingMethod,
    });
  }

  @action
  public async execute() {
    const span = Tracer.span('SyncInvoiceToAccountingUsecase.execute');

    if (!this.isQuickbooksConnected) {
      this.toggleConnecting();

      const [res, err] = await this.commonService.requestQuickbooksAccess(
        `${import.meta.env.VITE_CLIENT_APP_URL}/agents`,
        encodeURIComponent(
          `quickbooks:${this.agent?.id}:cid=${this.capability?.id}`,
        ),
      );

      if (err) {
        console.error(
          'SyncInvoiceToAccountingUsecase.execute: Error requesting quickbooks access',
          err,
        );
        span.end({
          error: err,
        });

        this.toggleConnecting();

        return;
      }

      if (res) {
        span.end({
          url: res.data.url,
        });

        this.toggleConnecting();

        window.location.href = res.data.url;
      }
    } else {
      this.toggleRevoking();

      const [res, err] = await this.commonService.revokeQuickbooksAccess();

      if (err) {
        console.error(
          'SyncInvoiceToAccountingUsecase.execute: Error revoking quickbooks access',
          err,
        );
        span.end();

        this.store.ui.toastError(
          'Error revoking quickbooks access',
          'revoke-quickbooks-access-error',
        );

        this.toggleRevoking();

        return;
      }

      if (res) {
        this.toggleRevoking();
        this.store.settings.oauthToken.loadQuickbooksStatus();
        this.toggleEnabled();
      }
    }

    span.end();
  }

  @action
  public async init() {
    const span = Tracer.span('SyncInvoiceToAccountingUsecase.init', {
      isQuickbooksConnected: this.isQuickbooksConnected,
      isEnabled: this.isEnabled,
    });

    if (!this.agent) {
      console.error('SyncInvoiceToAccountingUsecase.init: Agent is required');
      span.end();

      return;
    }

    if (!this.capability) {
      console.error(
        'SyncInvoiceToAccountingUsecase.init: Capability is required',
      );
      span.end();

      return;
    }

    const config = Agent.parseConfig<'quickbooks' | 'accountingMethodAccrual'>(
      this.capability.config,
    );

    if (!config) {
      console.error('SyncInvoiceToAccountingUsecase.init: Config is required');
      span.end();

      return;
    }

    if (!config.quickbooks) {
      console.error(
        'SyncInvoiceToAccountingUsecase.init: Quickbooks is required',
      );
      span.end();

      return;
    }
    this.store.settings.oauthToken.loadQuickbooksStatus();
    this.isEnabled = this.capability.active;
    this.accountingMethod = config.accountingMethodAccrual.value
      ? 'accrual'
      : 'cash';

    span.end({
      isQuickbooksConnected: this.isQuickbooksConnected,
      isEnabled: this.isEnabled,
    });
  }

  public dispose() {}
}
