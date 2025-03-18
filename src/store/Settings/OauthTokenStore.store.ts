import type { RootStore } from '@store/root';

import { Transport } from '@infra/transport';
import { runInAction, makeAutoObservable } from 'mobx';
import { CommonRepository } from '@infra/repositories/core/common';

import { MailboxProvider } from '@shared/types/__generated__/graphql.types';

export type OauthToken = {
  type: string;
  email: string;
  provider: string;
  needsManualRefresh: boolean;
};

export class OauthTokenStore {
  private commonRepository = new CommonRepository();

  tokens: Array<OauthToken> = [];
  isLoading = false;
  error: string | null = null;
  isBootstrapped = false;
  isQuickbooksConnected = false;

  constructor(private root: RootStore, private transport: Transport) {
    makeAutoObservable(this);
    this.loadQuickbooksStatus = this.loadQuickbooksStatus.bind(this);
  }

  async loadQuickbooksStatus() {
    try {
      const { data } = await this.commonRepository.getQuickbooksStatus();

      runInAction(() => {
        this.isQuickbooksConnected = data.quickbooksConnected;
      });
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error)?.message;
      });
    }
  }

  async load() {
    try {
      this.isLoading = true;

      const { data } = await this.transport.http.get<OauthToken[]>(
        `/internal/settings/user/settings/oauth/${this.root.session.value.tenant}`,
      );

      await this.loadQuickbooksStatus();

      runInAction(() => {
        this.tokens = data;
        this.isBootstrapped = true;
      });
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error)?.message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async enableSync(provider: string) {
    if (this.root.demoMode) {
      return;
    }

    try {
      const { data } = await this.transport.http.get<{ url: string }>(
        `/enable/${provider}-sync?origin=${window.location.pathname}${window.location.search}`,
      );

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
    }
  }

  async disableSync(email: string, provider: string) {
    if (this.root.demoMode) {
      return;
    }
    this.isLoading = true;
    await this.root.settings.revokeAccess(
      {
        tenant: this.root.session.value.tenant,
        provider: provider,
        email: email,
      },
      {
        onSuccess: () => this.onDisableSuccess(email),
        onError: (err) => this.onDisableError(err, provider),
      },
    );
  }

  private onDisableSuccess(email: string) {
    this.isLoading = false;
    this.root.ui.toastSuccess(
      `We have unlinked ${email}`,
      'disable-google-sync',
    );
    setTimeout(() => this.load(), 500);
  }

  private onDisableError(err: Error, provider: string) {
    const providerLabel =
      provider === MailboxProvider.Google ? 'Google' : 'Microsoft 365';

    this.error = err.message;
    this.isLoading = false;
    this.root.ui.toastError(
      `An error occurred while disabling the ${providerLabel} sync!`,
      'disable-google-sync',
    );
  }
}
