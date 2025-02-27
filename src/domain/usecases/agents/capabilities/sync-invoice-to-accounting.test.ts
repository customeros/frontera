import { RootStore } from '@store/root';
import { container } from '@infra/container';
import { Agent } from '@store/Agents/Agent.dto';
import {
  vi,
  test,
  expect,
  describe,
  afterAll,
  beforeAll,
  beforeEach,
} from 'vitest';

import { AgentType, CapabilityType } from '@graphql/types';

import { SyncInvoiceToAccountingUsecase } from './sync-invoice-to-accounting.usecase';

class CommonService {
  public requestQuickbooksAccess = vi.fn();
  public revokeQuickbooksAccess = vi.fn();
}

class AgentService {
  public saveAgent = vi.fn();
}

// Mock window.location
const originalLocation = window.location;

beforeAll(() => {
  // @ts-expect-error - Ignoring type error for delete operator
  delete window.location;
  window.location = { href: '' } as Location;
});

afterAll(() => {
  window.location = originalLocation;
});

container.register(CommonService, CommonService);
container.register(AgentService, AgentService);

const AGENT_ID = '1';
const agent = Agent.default({
  id: AGENT_ID,
  type: AgentType.CashflowGuardian,
  capabilities: [
    {
      id: '1',
      active: false,
      name: 'Sync invoice to accounting',
      type: CapabilityType.SyncInvoiceToAccounting,
      config: JSON.stringify({
        quickbooks: { value: false, error: '' },
        accountingMethodAccrual: { value: false, error: '' },
      }),
      errors: '',
    },
  ],
});

let usecase: SyncInvoiceToAccountingUsecase;
let _commonService: CommonService;
let _agentService: AgentService;
let store: RootStore;

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();

  // Setup store
  store = RootStore.getInstance();
  store.agents.addOne(agent);

  // Get service instances
  _commonService = container.resolve(CommonService);
  _agentService = container.resolve(AgentService);

  // Create usecase
  usecase = new SyncInvoiceToAccountingUsecase(AGENT_ID);
  usecase.init();
});

describe('Sync invoice to accounting usecase', () => {
  // 1. Basic Initialization
  test('should initialize the usecase', () => {
    const usecase = new SyncInvoiceToAccountingUsecase(AGENT_ID);

    usecase.init();

    expect(usecase.agent?.value).toStrictEqual(agent);
    expect(usecase.isEnabled).toBe(false);
    expect(usecase.isConnecting).toBe(false);
    expect(usecase.isRevokeOpen).toBe(false);
    expect(usecase.isRevoking).toBe(false);
    expect(usecase.accountingMethod).toBe('cash');
  });

  // 2. Toggle Enabled Functionality
  test('should toggle enabled when QuickBooks is connected', () => {
    // TODO: Implement test logic
    // 1. Mock isQuickbooksConnected to return true
    // 2. Call toggleEnabled
    // 3. Verify isEnabled is toggled
    // 4. Verify agent's toggleCapabilityStatus is called
    // 5. Verify agentService.saveAgent is called
    // 6. Mock successful response
    // 7. Verify agent.put is called with response
  });

  test('should not toggle enabled when QuickBooks is not connected', () => {
    // TODO: Implement test logic
    // 1. Mock isQuickbooksConnected to return false
    // 2. Call toggleEnabled
    // 3. Verify isEnabled is not toggled
    // 4. Verify agent's toggleCapabilityStatus is not called
    // 5. Verify agentService.saveAgent is not called
  });

  test('should handle error when toggling enabled', () => {
    // TODO: Implement test logic
    // 1. Mock isQuickbooksConnected to return true
    // 2. Mock agentService.saveAgent to return error
    // 3. Call toggleEnabled
    // 4. Verify error is handled properly
  });

  // 3. QuickBooks Connection Flow
  test('should request QuickBooks access when not connected', () => {
    // TODO: Implement test logic
    // 1. Mock isQuickbooksConnected to return false
    // 2. Call execute
    // 3. Verify isConnecting is toggled
    // 4. Verify commonService.requestQuickbooksAccess is called with correct parameters
    // 5. Mock successful response
    // 6. Verify window.location.href is set to response URL
    // 7. Verify isConnecting is toggled back
  });

  test('should revoke QuickBooks access when connected', () => {
    // TODO: Implement test logic
    // 1. Mock isQuickbooksConnected to return true
    // 2. Call execute
    // 3. Verify isRevoking is toggled
    // 4. Verify commonService.revokeQuickbooksAccess is called
    // 5. Mock successful response
    // 6. Verify isRevoking is toggled back
    // 7. Verify store.settings.oauthToken.loadQuickbooksStatus is called
    // 8. Verify toggleEnabled is called
  });

  test('should handle error when requesting QuickBooks access', () => {
    // TODO: Implement test logic
    // 1. Mock isQuickbooksConnected to return false
    // 2. Mock commonService.requestQuickbooksAccess to return error
    // 3. Call execute
    // 4. Verify error is handled properly
    // 5. Verify isConnecting is toggled back
  });

  test('should handle error when revoking QuickBooks access', () => {
    // TODO: Implement test logic
    // 1. Mock isQuickbooksConnected to return true
    // 2. Mock commonService.revokeQuickbooksAccess to return error
    // 3. Call execute
    // 4. Verify error is handled properly
    // 5. Verify isRevoking is toggled back
    // 6. Verify store.ui.toastError is called
  });

  // 4. Accounting Method Toggle
  test('should toggle accounting method from cash to accrual', () => {
    // TODO: Implement test logic
    // 1. Verify initial accountingMethod is 'cash'
    // 2. Call toggleAccountingMethod
    // 3. Verify accountingMethod is changed to 'accrual'
    // 4. Verify agent.setCapabilityConfig is called with correct parameters
    // 5. Verify agentService.saveAgent is called
    // 6. Mock successful response
    // 7. Verify agent.put is called with response
    // 8. Verify init is called
  });

  test('should toggle accounting method from accrual to cash', () => {
    // TODO: Implement test logic
    // 1. Set initial accountingMethod to 'accrual'
    // 2. Call toggleAccountingMethod
    // 3. Verify accountingMethod is changed to 'cash'
    // 4. Verify agent.setCapabilityConfig is called with correct parameters
    // 5. Verify agentService.saveAgent is called
    // 6. Mock successful response
    // 7. Verify agent.put is called with response
    // 8. Verify init is called
  });

  test('should handle error when toggling accounting method', () => {
    // TODO: Implement test logic
    // 1. Mock agentService.saveAgent to return error
    // 2. Call toggleAccountingMethod
    // 3. Verify error is handled properly
  });

  // 5. UI State Management
  test('should toggle isRevokeOpen state', () => {
    // TODO: Implement test logic
    // 1. Verify initial isRevokeOpen is false
    // 2. Call toggleRevokeOpen
    // 3. Verify isRevokeOpen is true
    // 4. Call toggleRevokeOpen again
    // 5. Verify isRevokeOpen is false
  });

  test('should toggle isConnecting state', () => {
    // TODO: Implement test logic
    // 1. Verify initial isConnecting is false
    // 2. Call toggleConnecting
    // 3. Verify isConnecting is true
    // 4. Call toggleConnecting again
    // 5. Verify isConnecting is false
  });

  test('should toggle isRevoking state', () => {
    // TODO: Implement test logic
    // 1. Verify initial isRevoking is false
    // 2. Call toggleRevoking
    // 3. Verify isRevoking is true
    // 4. Call toggleRevoking again
    // 5. Verify isRevoking is false
  });

  // 6. Computed Properties
  test('should return correct agent from computed property', () => {
    // TODO: Implement test logic
    // 1. Verify usecase.agent returns the correct agent
  });

  test('should return correct capability from computed property', () => {
    // TODO: Implement test logic
    // 1. Verify usecase.capability returns the correct capability
  });

  test('should return correct capability name from computed property', () => {
    // TODO: Implement test logic
    // 1. Verify usecase.capabilityName returns the correct name
  });

  test('should return correct QuickBooks connection status from computed property', () => {
    // TODO: Implement test logic
    // 1. Mock store.settings.oauthToken.isQuickbooksConnected
    // 2. Verify usecase.isQuickbooksConnected returns the correct value
  });
});
