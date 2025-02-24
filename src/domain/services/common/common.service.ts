import { Tracer } from '@infra/tracer';
import { RootStore } from '@store/root';
import { injectable } from '@infra/container';
import {
  CommonRepository,
  WebhookIntegration,
} from '@infra/repositories/common';

import { unwrap } from '@utils/unwrap';

@injectable
export class CommonService {
  private root = RootStore.getInstance();
  private repository = CommonRepository.getInstance();

  constructor() {}

  // TODO: move this method in common repository
  public async switchWorkspace(tenant: string) {
    const r = await this.root.session.transport.http.get<{
      redirectUrl: string;
    }>('/switchWorkspace?tenant=' + tenant);

    await this.root.session.clearSession();
    window.location.href = r.data.redirectUrl;

    return 'success';
  }

  public async getWebhookUrl(integration: WebhookIntegration) {
    const span = Tracer.span('CommonService.getWebhookUrl', {
      integration,
    });

    const req = await unwrap(
      this.repository.getWebhookUrl(integration, {
        headers: { 'X-CUSTOMER-OS-API-KEY': this.root.session.tenantApiKey! },
      }),
    );

    span.end();

    return req;
  }

  public async createWebhookUrl(integration: WebhookIntegration) {
    const span = Tracer.span('CommonService.createWebhookUrl', {
      integration,
    });

    const req = await unwrap(
      this.repository.createWebhookUrl(integration, {
        headers: { 'X-CUSTOMER-OS-API-KEY': this.root.session.tenantApiKey! },
      }),
    );

    span.end();

    return req;
  }

  public async getBrowserAutomationConfig() {
    const span = Tracer.span('CommonService.getBrowserAutomationConfig');

    const req = await unwrap(
      this.repository.getBrowserAutomationConfig({
        headers: {
          'X-OPENLINE-API-KEY': this.root.session.tenantApiKey!,
        },
      }),
    );

    span.end();

    return req;
  }

  public async requestQuickbooksAccess(redirect_uri?: string, state?: string) {
    const span = Tracer.span('CommonService.requestQuickbooksAccess', {
      redirect_uri,
      state,
    });

    const req = await unwrap(
      this.repository.requestQuickbooksAccess(redirect_uri, state),
    );

    span.end();

    return req;
  }

  public async quickbooksOauthCallback(
    code: string,
    realmId: string,
    redirect_uri?: string,
  ) {
    const span = Tracer.span('CommonService.quickbooksOauthCallback');

    const req = await unwrap(
      this.repository.quickbooksOauthCallback(code, realmId, redirect_uri),
    );

    span.end();

    return req;
  }

  public async revokeQuickbooksAccess() {
    const span = Tracer.span('CommonService.revokeQuickbooksAccess');

    const req = await unwrap(this.repository.revokeQuickbooksAccess());

    span.end();

    return req;
  }
}
