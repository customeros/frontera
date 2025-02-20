import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { Agent } from '@store/Agents/Agent.dto';
import { action, computed, observable, runInAction } from 'mobx';
import { AgentService } from '@domain/services/agent/agent.service';

import { CapabilityType } from '@graphql/types';
import { UploadResponse } from '@ui/form/FileUploader';

export class GenerateInvoiceUsecase {
  private service = new AgentService();
  private root = RootStore.getInstance();
  @observable accessor config = new GenerateInvoiceConfig();

  constructor(private readonly agentId: string) {
    this.setProperty = this.setProperty.bind(this);
    this.setCompanyLogo = this.setCompanyLogo.bind(this);
    this.removeCompanyLogo = this.removeCompanyLogo.bind(this);
    this.toggleBankDetails = this.toggleBankDetails.bind(this);
    this.onCompanyLogoError = this.onCompanyLogoError.bind(this);
    this.toggleBankInfoTemplate = this.toggleBankInfoTemplate.bind(this);

    setTimeout(this.init.bind(this), 0);
  }

  @action
  setConfig(value: GenerateInvoiceConfig) {
    this.config = value;
  }

  @computed
  get capability() {
    return this.root.agents.getById(this.agentId);
  }

  @computed
  get capabilityName() {
    return this.capability?.getCapabilityName(CapabilityType.GenerateInvoice);
  }

  @action
  async init() {
    const span = Tracer.span('GenerateInvoiceUsecase.init');

    const agent = this.root.agents.getById(this.agentId);

    if (!agent) {
      console.error('GenerateInvoiceUsecase.init: Agent not found, aborting.');
      span.end();

      return;
    }

    const capability = agent.value.capabilities.find(
      (c) => c.type === CapabilityType.GenerateInvoice,
    );

    if (!capability) {
      console.error(
        `GenerateInvoiceUsecase.init: Capability of type ${CapabilityType.GenerateInvoice} not found, aborting.`,
      );

      span.end();

      return;
    }
    this.config = new GenerateInvoiceConfig(capability.config);

    span.logArgs({
      config: this.config,
    });

    if (this.config.bankInfoTemplate.value === '') {
      this.toggleBankInfoTemplate('usa');
    }

    span.end();
  }

  @action
  setCompanyLogo(_refId: number, res: UploadResponse) {
    const span = Tracer.span('GenerateInvoiceUsecase.setCompanyLogo');

    this.config.logoRepositoryFileId.value = res.id;
    this.execute('logoRepositoryFileId');
    span.logArgs({
      res: res.id,
    });

    span.end();
  }

  @action
  setProperty(
    property: keyof GenerateInvoiceConfig,
    value: string | boolean | string[],
  ) {
    this.config[property].value = value;
  }

  onCompanyLogoError(_refId: number, error: string) {
    const span = Tracer.span('GenerateInvoiceUsecase.onCompanyLogoError');

    if (error) {
      console.error(
        'GenerateInvoiceUsecase.onCompanyLogoError: Could not upload company logo',
        error,
      );
    }

    this.root.ui.toastError(
      'Failed to upload company logo',
      'generate-invoice-company-logo-error',
    );

    span.end();
  }

  @action
  removeCompanyLogo() {
    const span = Tracer.span('GenerateInvoiceUsecase.removeCompanyLogo');

    this.config.logoRepositoryFileId.value = '';
    this.execute('logoRepositoryFileId');
    span.end();
  }

  @action
  toggleBankDetails() {
    const span = Tracer.span('GenerateInvoiceUsecase.toggleBankDetails', {
      includeBankTransferDetails: this.config.includeBankTransferDetails.value,
    });

    this.config.includeBankTransferDetails.value =
      !this.config.includeBankTransferDetails.value;
    this.execute('includeBankTransferDetails');

    span.end({
      includeBankTransferDetails: this.config.includeBankTransferDetails.value,
    });
  }

  @action
  toggleBankInfoTemplate(type: 'usa' | 'eu' | 'uk' | 'other') {
    const span = Tracer.span('GenerateInvoiceUsecase.toggleBankInfoTemplate', {
      bankInfoTemplate: this.config.bankInfoTemplate.value,
    });

    this.config.bankInfoTemplate.value = type;
    this.execute('bankInfoTemplate');

    span.end({
      bankInfoTemplate: this.config.bankInfoTemplate.value,
    });
  }

  async execute(property: keyof GenerateInvoiceConfig) {
    const span = Tracer.span('GenerateInvoiceUsecase.execute', {
      property,
      value: this.config[property].value,
    });

    const agent = this.root.agents.getById(this.agentId);

    if (!agent) {
      console.error(
        'GenerateInvoiceUsecase.execute: Agent not found, aborting.',
      );
      span.end();

      return;
    }

    agent.setCapabilityConfig(
      CapabilityType.GenerateInvoice,
      property,
      this.config[property].value,
    );

    const [res, err] = await this.service.saveAgent(agent);

    if (err) {
      console.error(
        'GenerateInvoiceUsecase.execute: Could not save agent',
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

  isBankInfoTemplate(...args: ('usa' | 'eu' | 'uk' | 'other')[]) {
    return args.includes(
      this.config.bankInfoTemplate.value as 'usa' | 'eu' | 'uk' | 'other',
    );
  }
}

class GenerateInvoiceConfig {
  bic = new ConfigProperty();
  zip = new ConfigProperty();
  iban = new ConfigProperty();
  region = new ConfigProperty();
  country = new ConfigProperty();
  bankName = new ConfigProperty();
  locality = new ConfigProperty();
  sortCode = new ConfigProperty();
  fromEmail = new ConfigProperty();
  legalName = new ConfigProperty();
  addressLine1 = new ConfigProperty();
  addressLine2 = new ConfigProperty();
  otherDetails = new ConfigProperty();
  accountNumber = new ConfigProperty();
  routingNumber = new ConfigProperty();
  bankInfoTemplate = new ConfigProperty();
  ccEmails = new ConfigProperty<string[]>();
  bccEmails = new ConfigProperty<string[]>();
  logoRepositoryFileId = new ConfigProperty();
  includeBankTransferDetails = new ConfigProperty<boolean>({
    value: false,
    error: '',
  });

  constructor(rawJSON?: string) {
    const span = Tracer.span('GenerateInvoiceConfig.constructor', {
      rawJSON,
    });

    if (rawJSON) {
      const config = Agent.parseConfig(rawJSON);

      if (!config) {
        console.error(
          `GenerateInvoiceConfig.init: Capability config is not valid, aborting.`,
        );

        span.end();

        return;
      }

      Object.entries(config).forEach(([key, value]) => {
        runInAction(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this[key as keyof GenerateInvoiceConfig] as any) =
            new ConfigProperty(value as ConfigProperty);
        });
      });
    }

    span.end();
  }
}

class ConfigProperty<T extends string | number | boolean | string[] = string> {
  @observable accessor value: T = '' as T;
  @observable accessor error: string | null = null;

  constructor(property?: { value?: T; error?: string | null }) {
    if (property) {
      this.value = property?.value ?? ('' as T);
      this.error = property?.error ?? null;
    }
  }
}
