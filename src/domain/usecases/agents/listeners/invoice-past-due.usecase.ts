import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { Agent } from '@store/Agents/Agent.dto';
import { action, computed, observable } from 'mobx';
import { AgentService } from '@domain/services/agent/agent.service';

import { AgentListenerEvent } from '@shared/types/__generated__/graphql.types';

export class InvoicePastDueUsecase {
  private service = new AgentService();
  private root = RootStore.getInstance();

  @observable accessor isEnabled = false;
  @observable accessor overdueDays = 14;

  constructor(private readonly agentId: string) {
    this.toggleCapability = this.toggleCapability.bind(this);
    this.setOverdueDays = this.setOverdueDays.bind(this);
    this.init = this.init.bind(this);
    this.execute = this.execute.bind(this);

    this.init();
  }

  @computed
  get listener() {
    return this.root.agents
      .getById(this.agentId)
      ?.value.listeners.find(
        (listener) => listener.type === AgentListenerEvent.InvoicePastDue,
      );
  }

  @computed
  get listenerName() {
    return this.listener?.name;
  }

  @action
  toggleCapability(value?: boolean) {
    this.isEnabled = value ?? !this.isEnabled;
  }

  @action
  setOverdueDays(value: number) {
    const span = Tracer.span('InvoicePastDueUsecase.setOverdueDays');

    this.overdueDays = value;

    this.execute();

    span.end();
  }

  @action
  init() {
    const span = Tracer.span('InvoicePastDueUsecase.init');

    if (!this.listener) {
      console.error('InvoicePastDueUsecase.init: listener not found');
      span.end();

      return;
    }

    const config = Agent.parseConfig<'overdueDays'>(this.listener.config);

    if (!config) {
      console.error('InvoicePastDueUsecase.init: config not found');
      span.end();

      return;
    }

    this.isEnabled = this.listener.active;
    this.overdueDays = config.overdueDays.value as number;

    span.end();
  }

  async execute() {
    const span = Tracer.span('InvoicePastDueUsecase.execute');

    const agent = this.root.agents.getById(this.agentId);

    if (!agent) {
      console.error('InvoicePastDueUsecase.execute: agent not found');
      span.end();

      return;
    }

    agent.setListenerConfig(
      AgentListenerEvent.InvoicePastDue,
      'overdueDays',
      this.overdueDays,
    );

    const [res, err] = await this.service.saveAgent(agent);

    if (err) {
      console.error(
        'InvoicePastDueUsecase.execute: error setting listener config',
        err,
      );
      span.end();

      return;
    }

    if (res) {
      agent.put(res.agent_Save);
      this.init();
    }

    span.end();
  }
}
