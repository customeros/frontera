import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { Agent } from '@store/Agents/Agent.dto';
import { action, computed, observable } from 'mobx';

import { CapabilityType } from '@graphql/types';
import { UploadResponse } from '@ui/form/FileUploader';

export class GenerateInvoiceUsecase {
  private root = RootStore.getInstance();
  @observable accessor config = new GenerateInvoiceConfig();

  constructor(private readonly agentId: string) {
    this.setProperty = this.setProperty.bind(this);
    this.setCompanyLogo = this.setCompanyLogo.bind(this);
    this.removeCompanyLogo = this.removeCompanyLogo.bind(this);
    this.toggleBankDetails = this.toggleBankDetails.bind(this);
    this.onCompanyLogoError = this.onCompanyLogoError.bind(this);
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

    span.end();
  }

  @action
  setCompanyLogo(_refId: number, res: UploadResponse) {
    const span = Tracer.span('GenerateInvoiceUsecase.setCompanyLogo');

    this.config.logoRepositoryField.value = res.id;

    span.logArgs({
      res: res.id,
    });

    span.end();
  }

  @action
  setProperty(property: keyof GenerateInvoiceConfig, value: string) {
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

    this.config.logoRepositoryField.value = '';

    span.end();
  }

  @action
  toggleBankDetails() {
    this.config.includeBankTransferDetails.value =
      !this.config.includeBankTransferDetails.value;
  }

  async execute() {}
}

class GenerateInvoiceConfig {
  bic = new ConfigProperty();
  zip = new ConfigProperty();
  iban = new ConfigProperty();
  region = new ConfigProperty();
  country = new ConfigProperty();
  bankName = new ConfigProperty();
  ccEmails = new ConfigProperty();
  locality = new ConfigProperty();
  sortCode = new ConfigProperty();
  bccEmails = new ConfigProperty();
  fromEmail = new ConfigProperty();
  legalName = new ConfigProperty();
  addressLine1 = new ConfigProperty();
  addressLine2 = new ConfigProperty();
  otherDetails = new ConfigProperty();
  accountNumber = new ConfigProperty();
  routingNumber = new ConfigProperty();
  logoRepositoryField = new ConfigProperty();
  includeBankTransferDetails = new ConfigProperty<boolean>();

  constructor(rawJSON?: string) {
    const span = Tracer.span('GenerateInvoiceConfig.constructor');

    if (rawJSON) {
      const config = Agent.parseConfig(rawJSON);

      if (!config) {
        console.error(
          `GenerateInvoiceConfig.init: Capability config is not valid, aborting.`,
        );

        span.end();

        return;
      }

      Object.assign(this, config);
    }

    span.end();
  }
}

class ConfigProperty<T extends string | number | boolean = string> {
  @observable accessor value: T = '' as T;
  @observable accessor error: string | null = null;

  constructor(property?: { value: T; error: string | null }) {
    if (property) {
      this.value = property?.value ?? '';
      this.error = property?.error ?? null;
    }
  }
}
