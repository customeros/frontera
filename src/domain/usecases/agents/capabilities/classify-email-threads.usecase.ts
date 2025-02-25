import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { Agent } from '@store/Agents/Agent.dto';
import { action, computed, observable } from 'mobx';
import { AgentService } from '@domain/services/agent/agent.service';

import { CapabilityType } from '@graphql/types';
type ClassifyEmailThreadsValue = 'AUTOMATICALLY' | 'MANUALLY';

export class ClassifyEmailThreadsUsecase {
  private service = new AgentService();
  private root = RootStore.getInstance();
  @observable accessor value: ClassifyEmailThreadsValue = 'AUTOMATICALLY';
  @observable accessor importEmailsError: string = '';
  constructor(private agentId: string) {
    this.execute = this.execute.bind(this);
    this.init();
  }

  @computed
  get capabilityErrors() {
    return this.root.agents
      .getById(this.agentId)
      ?.value.capabilities.find((c) => c.type === CapabilityType.ClassifyEmail)
      ?.errors;
  }

  @action
  init() {
    const span = Tracer.span('ClassifyEmailThreadsUsecase.init', {
      value: this.value,
    });

    const agent = this.root.agents.getById(this.agentId);

    if (!agent) {
      console.error(
        'ClassifyEmailThreadsUsecase.init: Agent not found. aborting execution',
      );

      return;
    }

    const capability = agent.value.capabilities.find(
      (c) => c.type === CapabilityType.ClassifyEmail,
    );

    if (!capability) {
      console.error(
        'ClassifyEmailThreadsUsecase.init: Capability not found. aborting execution',
      );

      return;
    }

    const config = Agent.parseConfig(capability.config);

    if (!config) {
      console.error(
        'ClassifyEmailThreadsUsecase.init: Could not parse config. aborting',
      );

      return;
    }

    if (!config.importEmails) {
      console.error(
        'ClassifyEmailThreadsUsecase.init: importEmails not found in config. aborting execution',
      );

      return;
    }

    this.value = config.importEmails.value as ClassifyEmailThreadsValue;
    this.importEmailsError = config.importEmails.error as string;
    span.end({
      value: config.importEmails.value,
      importEmailsError: this.importEmailsError,
    });
  }

  async execute(value: ClassifyEmailThreadsValue) {
    this.value = value;

    const span = Tracer.span('ClassifyEmailThreadsUsecase.execute', {
      value: value,
    });
    const agent = this.root.agents.getById(this.agentId);

    if (!agent) {
      console.error(
        'ClassifyEmailThreadsUsecase: Agent not found. aborting execution',
      );

      return;
    }

    agent?.setCapabilityConfig(
      CapabilityType.ClassifyEmail,
      'importEmails',
      value,
    );

    const [res, err] = await this.service.saveAgent(agent);

    if (err) {
      console.error(
        'ClassifyEmailThreadsUsecase.execute: Error saving agent. aborting execution',
      );
    }

    if (res) {
      agent.put(res?.agent_Save);
      this.init();
    }

    span.end();
  }
}
