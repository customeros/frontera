import type { Channel } from 'phoenix';
import type { RootStore } from '@store/root';

import { Persister } from '@store/persister';
import { Transport } from '@infra/transport';
import { when, makeAutoObservable } from 'mobx';
import { SystemSyncPacket } from '@store/types';

import { toastError, toastSuccess } from '@ui/presentation/Toast';

import { CommandMenuStore } from './CommandMenu.store';
import { FlowActionSidePanelStore } from './FlowActionSidePanel.store';
import { FlowStepCommandMenuStore } from './FlowStepCommandMenu.store';

export class UIStore {
  searchCount: number = 0;
  filteredTable: Array<unknown> = [];
  isSearching: string | null = null;
  isFilteringTable: boolean = false;
  isEditingTableCell: boolean = false;
  dirtyEditor: string | null = null;
  activeConfirmation: string | null = null;
  focusRow: string | null = null;
  isEditingDefaultFilters: boolean = false;
  showShortcutsPanel: boolean = false;
  showPreviewCard: boolean = false;
  showLeadSources: boolean = false;
  commandMenu = new CommandMenuStore();
  flowCommandMenu = new FlowStepCommandMenuStore();
  flowActionSidePanel = new FlowActionSidePanelStore();
  isSystemNotificationOpen = false;
  private channel?: Channel;
  private activeConfirmationCallback: () => void = () => {};

  constructor(private root: RootStore, private transport: Transport) {
    makeAutoObservable(this);
    this.toastSuccess = this.toastSuccess.bind(this);
    this.purgeLocalData = this.purgeLocalData.bind(this);

    when(
      () => !!this.root?.session?.value?.tenant && !this.root.demoMode,
      async () => {
        try {
          await this.initChannelConnection();
        } catch (e) {
          console.error(e);
        }
      },
    );
  }

  /** @deprecated - use UtilService.toastSuccess() */
  toastSuccess(text: string, id: string) {
    // redundant call to toastSuccess - should be refactored
    toastSuccess(text, id);
  }

  /** @deprecated - use UtilService.toastError() */
  toastError(text: string, id: string) {
    // redundant call to toastError - should be refactored
    toastError(text, id);
  }

  setIsSearching(value: string | null) {
    this.isSearching = value;
  }

  setShortcutsPanel(value: boolean) {
    if (value && this.showPreviewCard) {
      this.showPreviewCard = false;
    }

    this.showShortcutsPanel = value;
  }

  setShowPreviewCard(value: boolean) {
    if (value && this.showShortcutsPanel) {
      this.showShortcutsPanel = false;
    }
    this.showPreviewCard = value;
  }

  setIsFilteringTable(value: boolean) {
    this.isFilteringTable = value;
  }

  setIsEditingTableCell(value: boolean) {
    this.isEditingTableCell = value;
  }

  setDirtyEditor(value: string | null) {
    this.dirtyEditor = value;
  }

  clearDirtyEditor() {
    this.dirtyEditor = null;
  }

  confirmAction(id: string, callback?: () => void) {
    this.activeConfirmation = id;
    callback && (this.activeConfirmationCallback = callback);
  }

  clearConfirmAction() {
    this.activeConfirmation = null;
    this.activeConfirmationCallback?.();
  }

  setSearchCount(value: number) {
    this.searchCount = value;
  }

  setFilteredTable(data: Array<unknown>) {
    this.filteredTable = data;
  }

  setFocusRow(value: string | null) {
    this.focusRow = value;
  }

  setIsEditingDefaultFilters(value: boolean) {
    this.isEditingDefaultFilters = value;
  }

  setShowLeadSources(value: boolean) {
    this.showLeadSources = value;
  }

  purgeLocalData() {
    Persister.attemptPurge({ force: true });
    this.toastSuccess(
      'Re-sync done. Refreshing in order to continue...',
      're-sync',
    );
    setTimeout(() => window.location.reload(), 2000);
  }

  showSystemNotification() {
    this.isSystemNotificationOpen = true;
  }

  private async initChannelConnection() {
    try {
      const connection = await this.transport.join('System', 'all', 0, true);

      if (!connection) return;

      this.channel = connection.channel;
      this.subscribe();
    } catch (e) {
      console.error(e);
    }
  }

  private subscribe() {
    if (!this.channel || this.root.demoMode) return;

    this.channel.on('sync_group_packet', (packet: SystemSyncPacket) => {
      if (packet.action === 'NEW_VERSION_AVAILABLE') {
        this.showSystemNotification();
      }
    });
  }
}
