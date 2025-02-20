import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { Agent } from '@store/Agents/Agent.dto';
import { action, computed, observable } from 'mobx';
import { AgentService } from '@domain/services/agent/agent.service';

import { AgentListenerEvent } from '@graphql/types';

interface EmailConfig {
  email: string;
  provider: 'google' | 'azure';
}

interface ListenerConfig {
  emails: {
    errors: string;
    value: EmailConfig[];
  };
}

export class NewEmailsUsecase {
  private service = new AgentService();
  private root = RootStore.getInstance();
  @observable accessor emails: EmailConfig[] = [];
  @observable accessor configError: string = '';

  constructor(private agentId: string) {
    this.execute = this.execute.bind(this);
    this.setEmails = this.setEmails.bind(this);
  }

  @action
  setEmails(emails: EmailConfig[]) {
    this.emails = emails;
  }

  @computed
  get listenerErrors() {
    return this.root.agents
      .getById(this.agentId)
      ?.value.listeners.find((c) => c.type === AgentListenerEvent.NewEmail)
      ?.errors;
  }

  @action
  init() {
    const span = Tracer.span('NewEmailsUsecase.init', {
      emails: this.emails,
    });

    const agent = this.root.agents.getById(this.agentId);

    if (!agent) {
      console.error(
        'NewEmailsUsecase.init: Agent not found. aborting execution',
      );

      return;
    }

    const listener = agent.value.capabilities.find(
      (c) => c.type === listenerType.ClassifyEmail,
    );

    if (!listener) {
      console.error(
        'NewEmailsUsecase.init: listener not found. aborting execution',
      );

      return;
    }

    const config = Agent.parseConfig(listener.config);

    if (!config) {
      console.error('NewEmailsUsecase.init: Could not parse config. aborting');

      return;
    }

    if (!config.emails) {
      console.error(
        'NewEmailsUsecase.init: emails configuration not found. aborting execution',
      );

      return;
    }

    this.emails = config.emails.value ?? [];
    this.configError = config.emails.error ?? '';

    span.end({
      emails: this.emails,
      configError: this.configError,
    });
  }

  async execute() {
    const span = Tracer.span('NewEmailsUsecase.execute', {
      emails: this.emails,
    });

    const agent = this.root.agents.getById(this.agentId);

    if (!agent) {
      console.error('NewEmailsUsecase: Agent not found. aborting execution');

      return;
    }

    agent?.setListenerConfig(
      AgentListenerEvent.NewEmail,
      'emails',
      this.emails,
    );

    const [res, err] = await this.service.saveAgent(agent);

    if (err) {
      console.error(
        'NewEmailsUsecase.execute: Error saving agent. aborting execution',
      );
    }

    if (res) {
      agent.put(res?.agent_Save);
      this.init();
    }

    span.end();
  }
}
