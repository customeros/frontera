import { Page, expect } from '@playwright/test';

import { FlowStatuses } from './flowsStatuses';
import {
  createTinyUUID,
  createRequestPromise,
  createResponsePromise,
  clickLocatorsThatAreVisible,
} from '../../helper';

export class FlowsPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  finderTableFlows = 'div[data-test="finder-table-FLOW"]';
  sideNavItemAllFlows = 'button[data-test="side-nav-item-all-flows"]';
  sideNavItemAllFlowsSelected =
    'button[data-test="side-nav-item-all-flows"] div[aria-selected="true"]';
  private allOrgsSelectAllOrgs = 'div[data-test="all-orgs-select-all-orgs"]';
  addNewFlow = 'button[data-test="add-new-flow"]';
  createNewFlowModalTitle = 'h1[data-test="create-new-flow-modal-title"]';
  createNewFlowName = 'input[data-test="create-new-flow-name"]';
  cancelCreateNewFlow = 'button[data-test="cancel-create-new-flow"]';
  confirmCreateNewFlow = 'button[data-test="confirm-create-new-flow"]';

  flowNameInFlowsTable = 'div[data-test="flow-name-in-flows-table"]';
  flowStatusTextInFlowsTable = 'p[data-test="flow-status-text-in-flows-table"]';
  flowStatusButtonInFlowsTable =
    'button[data-test="flow-status-button-in-flows-table"]';
  flowOnHoldInFlowsTable = 'span[data-test="flow-on-hold-in-flows-table"]';
  flowReadyInFlowsTable = 'span[data-test="flow-ready-in-flows-table"]';
  flowScheduledInFlowsTable = 'span[data-test="flow-scheduled-in-flows-table"]';
  flowInProgressInFlowsTable =
    'span[data-test="flow-in-progress-in-flows-table"]';
  flowCompletedInFlowsTable = 'span[data-test="flow-completed-in-flows-table"]';
  flowGoalAchievedInFlowsTable =
    'span[data-test="flow-goal-achieved-in-flows-table"]';
  // flowNotStartedInFlowsTable =
  //   'div[data-test="flow-not-started-in-flows-table"]';
  // flowInProgressInFlowsTable =
  //   'span[data-test="flow-in-progress-in-flows-table"]';
  // flowCompletedInFlowsTable = 'span[data-test="flow-completed-in-flows-table"]';
  // flowGoalAchievedInFlowsTable =
  //   'span[data-test="flow-goal-achieved-in-flows-table"]';

  private flowsActionsArchive = 'button[data-test="actions-archive"]';
  private orgActionsConfirmArchive =
    'button[data-test="org-actions-confirm-archive"]';
  private flowStatuses =
    'div[data-test="flow-statuses"] > div[role="menuitem"]';
  private flowsStatusLive = 'div[data-test="flow-status-ACTIVE"]';
  private flowsStatusNotStarted = 'div[data-test="flow-status-INACTIVE"]';
  private flowsStatusPaused = 'div[data-test="flow-status-PAUSED"]';

  async goToFlows() {
    await clickLocatorsThatAreVisible(this.page, this.sideNavItemAllFlows);
  }

  async addFlow() {
    // testInfo?: TestInfo, // organizationCreatorLocator: string,
    await clickLocatorsThatAreVisible(this.page, this.addNewFlow);

    const createNewFlowModalTitleInput = this.page.locator(
      this.createNewFlowModalTitle,
    );

    await expect(createNewFlowModalTitleInput).toHaveText('Create new flow');

    await clickLocatorsThatAreVisible(this.page, this.createNewFlowName);

    const flowName = createTinyUUID();

    const requestPromise = createRequestPromise(
      this.page,
      'input?.name',
      flowName,
    );

    const responsePromise = createResponsePromise(
      this.page,
      'flow_Merge?.metadata?.id',
      undefined,
    );

    await this.page.keyboard.type(flowName);
    await this.page.keyboard.press('Enter');

    await Promise.all([requestPromise, responsePromise]);
    // await this.page.waitForSelector(
    //   `${this.finderTableFlows} ${this.flowNameInFlowsTable}:has-text("${flowName}")`,
    //   { timeout: 30000 },
    // );

    return flowName;
  }

  async checkNewFlowEntry(
    expectedFlowName: string,
    expectedFlow: {
      ready: string;
      onHold: string;
      scheduled: string;
      completed: string;
      inProgress: string;
      goalAchieved: string;
      status: FlowStatuses;
    },
  ) {
    for (let i = 0; i < 5; i++) {
      try {
        const flowNameInAllOrgsTable = this.page
          .locator(
            `${this.finderTableFlows} ${this.flowNameInFlowsTable}:has-text("${expectedFlowName}")`,
          )
          .locator('..')
          .locator('..')
          .locator('..')
          .locator('..')
          .locator('..');

        await this.page.waitForSelector('[data-index="0"]', { timeout: 30000 });

        const actualFlow = await flowNameInAllOrgsTable
          .locator(this.flowNameInFlowsTable)
          .innerText();

        const actualFlowStatusInAllOrgsTable = await flowNameInAllOrgsTable
          .locator(this.flowStatusTextInFlowsTable)
          .innerText();

        const actualFlowOnHoldInFlowsTable = await flowNameInAllOrgsTable
          .locator(this.flowOnHoldInFlowsTable)
          .innerText();

        const actualFlowReadyInFlowsTable = await flowNameInAllOrgsTable
          .locator(this.flowReadyInFlowsTable)
          .innerText();

        const actualFlowScheduledInFlowsTable = await flowNameInAllOrgsTable
          .locator(this.flowScheduledInFlowsTable)
          .innerText();

        const actualFlowInProgressInFlowsTable = await flowNameInAllOrgsTable
          .locator(this.flowInProgressInFlowsTable)
          .innerText();

        const actualFlowCompletedInFlowsTable = await flowNameInAllOrgsTable
          .locator(this.flowCompletedInFlowsTable)
          .innerText();

        const actualFlowGoalAchievedInFlowsTable = await flowNameInAllOrgsTable
          .locator(this.flowGoalAchievedInFlowsTable)
          .innerText();

        expect(actualFlow).toBe(expectedFlowName);
        expect(actualFlowStatusInAllOrgsTable).toBe(expectedFlow.status);
        expect(actualFlowOnHoldInFlowsTable).toBe(expectedFlow.onHold);
        expect(actualFlowReadyInFlowsTable).toBe(expectedFlow.ready);
        expect(actualFlowScheduledInFlowsTable).toBe(expectedFlow.scheduled);
        expect(actualFlowInProgressInFlowsTable).toBe(expectedFlow.inProgress);
        expect(actualFlowCompletedInFlowsTable).toBe(expectedFlow.completed);
        expect(actualFlowGoalAchievedInFlowsTable).toBe(
          expectedFlow.goalAchieved,
        );
        break;
      } catch (e) {
        if (i === 4) throw e;
        await this.page.reload();
        await this.page.waitForTimeout(10000);
      }
    }
  }

  async waitForPageLoad() {
    await clickLocatorsThatAreVisible(this.page, this.sideNavItemAllFlows);
  }

  async selectAllFlows() {
    const allFlowsSelectAllContacts = this.page.locator(
      this.allOrgsSelectAllOrgs,
    );

    await allFlowsSelectAllContacts.click();
  }

  async archiveOrgs() {
    await clickLocatorsThatAreVisible(this.page, this.flowsActionsArchive);
  }

  async confirmArchiveOrgs() {
    await clickLocatorsThatAreVisible(this.page, this.orgActionsConfirmArchive);
  }

  async checkFlowStatuses(flowName: string, live: string) {
    const flowNameInFlowsTable = this.page
      .locator(
        `${this.finderTableFlows} ${this.flowNameInFlowsTable}:has-text("${flowName}")`,
      )
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('..');

    await flowNameInFlowsTable
      .locator(this.flowStatusButtonInFlowsTable)
      .click();

    const flowStatusesGroup = this.page.locator(this.flowStatuses);

    await Promise.all([
      expect.soft(flowStatusesGroup).toHaveCount(3),
      expect.soft(flowStatusesGroup.nth(0)).toHaveText('Live'),
      expect.soft(flowStatusesGroup.nth(1)).toHaveText('Not Started'),
      expect.soft(flowStatusesGroup.nth(2)).toHaveText('Paused'),
    ]);

    await this.page.keyboard.press('Escape');
  }
}
