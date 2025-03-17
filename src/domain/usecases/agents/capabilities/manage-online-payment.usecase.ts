import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { action, computed, observable } from 'mobx';
import { AgentService } from '@domain/services/agent/agent.service';

import { CapabilityType } from '@graphql/types';

export class ManageOnlinePaymentUsecase {
  private service = new AgentService();
  private root = RootStore.getInstance();

  @observable accessor isConnecting = false;
  @observable accessor isDisableDialogOpen = false;

  constructor(private readonly agentId: string) {
    this.setIsConnecting = this.setIsConnecting.bind(this);
    this.toggleCapability = this.toggleCapability.bind(this);
    setTimeout(this.init.bind(this), 0);
  }

  @computed
  get capability() {
    return this.root.agents
      .getById(this.agentId)
      ?.value?.capabilities.find(
        (v) => v.type === CapabilityType.ProcessAutopayment,
      );
  }

  @computed
  get capabilityName() {
    return this.capability?.name;
  }

  @action
  setIsDisableDialogOpen(value: boolean) {
    const span = Tracer.span(
      'ManageOnlinePaymentUsecase.setIsDisableDialogOpen',
    );

    this.isDisableDialogOpen = value;
    span.end();
  }

  @action
  setIsConnecting(value: boolean) {
    const span = Tracer.span('ManageOnlinePaymentUsecase.setIsConnecting');

    this.isConnecting = value;
    span.end();
  }

  @action
  toggleCapability(value?: boolean) {
    const span = Tracer.span('ManageOnlinePaymentUsecase.toggleCapability', {
      isEnabled: this.capability?.active,
    });

    this.execute(value);

    span.end({
      isEnabled: this.capability?.active,
    });
  }

  @action
  async init() {
    const span = Tracer.span('ManageOnlinePaymentUsecase.init', {
      isEnabled: this.isEnabled,
    });

    const agent = this.root.agents.getById(this.agentId);

    if (!agent) {
      console.error(
        'ManageOnlinePaymentUsecase.init: Agent not found, aborting.',
      );
      span.end();

      return;
    }

    const capability = agent.value.capabilities.find(
      (c) => c.type === CapabilityType.ProcessAutopayment,
    );

    if (!capability) {
      console.error(
        'ManageOnlinePaymentUsecase.init: Capability not found, aborting.',
      );
      span.end();

      return;
    }

    this.isEnabled = capability.active;

    span.end({
      isEnabled: this.isEnabled,
    });
  }

  async execute(isActive?: boolean) {
    const span = Tracer.span('ManageOnlinePaymentUsecase.execute', {
      isEnabled: this.capability?.active,
    });

    const agent = this.root.agents.getById(this.agentId);

    if (!agent) {
      console.error(
        'ManageOnlinePaymentUsecase.execute: Agent not found, aborting.',
      );
      span.end();

      return;
    }

    agent?.toggleCapabilityStatus(CapabilityType.ProcessAutopayment, isActive);

    const [res, err] = await this.service.saveAgent(agent);

    if (err) {
      console.error(
        'ManageOnlinePaymentUsecase.execute: Error saving agent, aborting.',
      );
    }

    if (res) {
      agent.put(res.agent_Save);
      this.init();
    }

    span.end({
      isEnabled: this.capability?.active,
    });
  }
}
