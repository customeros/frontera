import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { action, computed, observable } from 'mobx';
import { AgentService } from '@domain/services/agent/agent.service';

import { AgentType } from '@shared/types/__generated__/graphql.types';

export class ToggleAgentActiveUsecase {
  private service = new AgentService();
  private root = RootStore.getInstance();
  @observable accessor isOpen: boolean = false;

  constructor(private id: string) {
    this.toggleActive = this.toggleActive.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleAgentStatus = this.toggleAgentStatus.bind(this);
  }

  @computed
  get agent() {
    return this.root.agents.getById(this.id);
  }

  @action
  toggleModal() {
    this.isOpen = !this.isOpen;
  }

  @action
  toggleAgentStatus() {
    if (!this.agent) {
      console.error(
        'ToggleAgentActiveUsecase.toggleStatus: Agent not found. Aborting',
      );

      return;
    }

    this.agent.toggleStatus();
  }

  @action
  async toggleActive() {
    const span = Tracer.span('ToggleAgentActiveUsecase.toggleActive');

    if (!this.agent) {
      console.error(
        'ToggleAgentActiveUsecase.toggleActive: Agent not found. Aborting',
      );

      return;
    }

    if (this.agent.value.type === AgentType.CashflowGuardian) {
      if (!this.agent.value.isActive && !this.isOpen) {
        this.agent.toggleStatus();
      } else {
        this.toggleModal();
      }
    }

    if (this.agent.value.type !== AgentType.CashflowGuardian) {
      this.agent.toggleStatus();
    }

    const [res, err] = await this.service.saveAgent(this.agent);

    if (err) {
      console.error(
        'ToggleAgentActiveUsecase.toggleActive: Could not toggle agent active',
        err,
      );
    }

    if (res?.agent_Save) {
      this.agent?.put(res?.agent_Save);
    }

    span.end();
  }
}
