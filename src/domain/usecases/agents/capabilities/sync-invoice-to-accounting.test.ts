import { RootStore } from '@store/root';
import { container } from '@infra/container';
import { Agent } from '@store/Agents/Agent.dto';
import { vi, test, expect, describe, beforeAll } from 'vitest';

import { AgentType, CapabilityType } from '@graphql/types';

import { SyncInvoiceToAccountingUsecase } from './sync-invoice-to-accounting.usecase';

class CommonService {
  public requestQuickbooksAccess = vi.fn();
  public revokeQuickbooksAccess = vi.fn();
}

class AgentService {
  public saveAgent = vi.fn();
}

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
      }),
      errors: '',
    },
  ],
});

beforeAll(() => {
  const store = RootStore.getInstance();

  store.agents.addOne(agent);
});

describe('Sync invoice to accounting usecase', () => {
  test('should initialize the usecase', () => {
    const usecase = new SyncInvoiceToAccountingUsecase(AGENT_ID);

    usecase.init();

    expect(usecase.agent?.value).toStrictEqual(agent);
    expect(usecase.isEnabled).toBe(false);
    expect(usecase.isConnecting).toBe(false);
    expect(usecase.isRevokeOpen).toBe(false);
    expect(usecase.isRevoking).toBe(false);
  });
});
