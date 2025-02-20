import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { AgentService } from '@domain/services/agent/agent.service';

export class EditAgentStatusUsecase {
  private service = new AgentService();
  private root = RootStore.getInstance();

  constructor(private readonly agentId: string) {
    this.toggleActive = this.toggleActive.bind(this);
  }

  get agent() {
    return this.root.agents.getById(this.agentId);
  }

  async toggleActive() {
    const span = Tracer.span('AgentViewUsecase.toggleActive');

    if (!this.agent) {
      console.error('AgentViewUsecase.toggleActive: Agent not found. Aborting');

      return;
    }
    this.agent.toggleStatus();

    const [res, err] = await this.service.saveAgent(this.agent);

    if (err) {
      console.error(
        'EditAgentStatusUsecase.toggleActive: Could not toggle agent active',
        err,
      );
    }

    if (res?.agent_Save) {
      this.agent?.put(res?.agent_Save);
    }

    if (this.agent?.value.isActive) {
      this.root.ui.toastSuccess(
        `${this.agent?.value.name} is now turned on`,
        'agent-status-toggle-on',
      );
    } else {
      this.root.ui.toastSuccess(
        `${this.agent?.value.name} is now turned off`,
        'agent-status-toggle-off',
      );
    }

    span.end();
  }
}
