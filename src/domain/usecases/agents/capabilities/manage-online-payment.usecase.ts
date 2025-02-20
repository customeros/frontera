import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { action, computed, observable } from 'mobx';

import { CapabilityType } from '@shared/types/__generated__/graphql.types';

export class ManageOnlinePaymentUsecase {
  private root = RootStore.getInstance();

  @observable accessor isConnecting = false;
  @observable accessor isEnabled = false;

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
  setIsConnecting(value: boolean) {
    const span = Tracer.span('ManageOnlinePaymentUsecase.setIsConnecting');

    this.isConnecting = value;
    span.end();
  }

  @action
  toggleCapability() {
    const span = Tracer.span('ManageOnlinePaymentUsecase.toggleCapability', {
      isEnabled: this.isEnabled,
    });

    this.isEnabled = !this.isEnabled;
    // this.capability!.active = this.isEnabled;

    span.end({
      isEnabled: this.isEnabled,
    });
  }

  async init() {
    const span = Tracer.span('ManageOnlinePaymentUsecase.init');

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

    span.end();
  }
}
