import { Transport } from '@infra/transport';
import { SkusStore } from '@store/Sku/Skus.store.ts';
import { when, runInAction, makeAutoObservable } from 'mobx';

import { Persister } from './persister';
import { UIStore } from './UI/UI.store';
import { Tasks } from './Tasks/Tasks.store';
import { MailStore } from './Mail/Mail.store';
import { TagsStore } from './Tags/Tags.store';
import { WindowManager } from './window-manager';
import { FilesStore } from './Files/Files.store';
import { FlowsStore } from './Flows/Flows.store';
import { AgentStore } from './Agents/Agent.store';
import { TransactionService } from './transaction';
import { UsersStore } from './Users/Users.store.ts';
import { CommonStore } from './Common/Common.store';
import { SessionStore } from './Session/Session.store';
import { SettingsStore } from './Settings/Settings.store';
import { InvoicesStore } from './Invoices/Invoices.store';
import { ContactsStore } from './Contacts/Contacts.store';
import { MailboxesStore } from './Settings/Mailboxes.store';
import { ContractsStore } from './Contracts/Contracts.store';
import { RemindersStore } from './Reminders/Reminders.store';
import { JobRolesStore } from './JobRoles/JobRoles.store.ts';
import { EmailsInbox } from './EmailInbox/EmailsInbox.store';
import { IndustriesStore } from './Industries/Industries.store';
import { DocumentsStore } from './Documents/Documents.store.ts';
import { CustomFieldsStore } from './Settings/CustomFields.store';
import { GlobalCacheStore } from './GlobalCache/GlobalCache.store';
import { FlowSendersStore } from './FlowSenders/FlowSenders.store';
import { TableViewDefStore } from './TableViewDefs/TableViewDef.store';
import { OpportunitiesStore } from './Opportunities/Opportunities.store';
import { OrganizationsStore } from './Organizations/Organizations.store';
import { TimelineEventsStore } from './TimelineEvents/TimelineEvents.store';
import { FlowParticipantsStore } from './FlowParticipants/FlowParticipants.store';
import { ContractLineItemsStore } from './ContractLineItems/ContractLineItems.store';
import { FlowEmailVariablesStore } from './FlowEmailVariables/FlowEmailVariables.store';
import { ExternalSystemInstancesStore } from './ExternalSystemInstances/ExternalSystemInstances.store';

const RETRY_DELAY = 1000;
const MAX_BOOTSTRAP_RETRIES = 3;

export class RootStore {
  demoMode = false;
  transactions: TransactionService;
  bootstrapIsRetrying = false;
  private bootstrapRetryCount = 0;
  private transport = Transport.getInstance();
  private retryTimeoutId: NodeJS.Timeout | null = null;

  ui: UIStore;
  mail: MailStore;
  tags: TagsStore;
  files: FilesStore;
  users: UsersStore;
  flows: FlowsStore;
  agents: AgentStore;
  common: CommonStore;
  settings: SettingsStore;
  session: SessionStore;
  invoices: InvoicesStore;
  contacts: ContactsStore;
  emailsInbox: EmailsInbox;
  flowSenders: FlowSendersStore;
  contracts: ContractsStore;
  reminders: RemindersStore;
  windowManager: WindowManager;
  globalCache: GlobalCacheStore;
  flowParticipants: FlowParticipantsStore;
  customFields: CustomFieldsStore;
  tableViewDefs: TableViewDefStore;
  organizations: OrganizationsStore;
  industries: IndustriesStore;
  opportunities: OpportunitiesStore;
  timelineEvents: TimelineEventsStore;
  contractLineItems: ContractLineItemsStore;
  flowEmailVariables: FlowEmailVariablesStore;
  mailboxes: MailboxesStore;
  externalSystemInstances: ExternalSystemInstancesStore;
  jobRoles: JobRolesStore;
  skus: SkusStore;
  tasks: Tasks;
  documents: DocumentsStore;
  static instance: RootStore;

  constructor() {
    makeAutoObservable(this);

    this.transactions = new TransactionService(this, this.transport);
    this.common = new CommonStore(this);
    this.tableViewDefs = new TableViewDefStore(this, this.transport);
    this.settings = new SettingsStore(this, this.transport);
    this.ui = new UIStore(this, this.transport);
    this.windowManager = new WindowManager(this);
    this.mail = new MailStore(this, this.transport);
    this.tags = new TagsStore(this, this.transport);
    this.files = new FilesStore(this, this.transport);
    this.users = new UsersStore(this, this.transport);
    this.flows = new FlowsStore(this, this.transport);
    this.agents = new AgentStore(this, this.transport);
    this.session = new SessionStore(this, this.transport);
    this.industries = new IndustriesStore(this, this.transport);
    this.mailboxes = new MailboxesStore(this, this.transport);
    this.invoices = new InvoicesStore(this, this.transport);
    this.jobRoles = new JobRolesStore(this, this.transport);
    this.contacts = new ContactsStore(this, this.transport);
    this.contracts = new ContractsStore(this, this.transport);
    this.reminders = new RemindersStore(this, this.transport);
    this.emailsInbox = new EmailsInbox(this, this.transport);
    this.customFields = new CustomFieldsStore(this, this.transport);
    this.globalCache = new GlobalCacheStore(this, this.transport);
    this.flowSenders = new FlowSendersStore(this, this.transport);
    this.flowParticipants = new FlowParticipantsStore(this, this.transport);
    this.organizations = new OrganizationsStore(this, this.transport);
    this.opportunities = new OpportunitiesStore(this, this.transport);
    this.timelineEvents = new TimelineEventsStore(this, this.transport);
    this.contractLineItems = new ContractLineItemsStore(this, this.transport);
    this.flowEmailVariables = new FlowEmailVariablesStore(this, this.transport);
    this.skus = new SkusStore(this, this.transport);
    this.externalSystemInstances = new ExternalSystemInstancesStore(
      this,
      this.transport,
    );
    this.tasks = new Tasks(this, this.transport);
    this.documents = new DocumentsStore(this, this.transport);

    this.bootstrap = this.bootstrap.bind(this);

    when(
      () => this.isAuthenticated,
      async () => {
        await this.bootstrap();
      },
    );

    when(
      () => this.isHydrated,
      async () => {
        await Persister.attemptPurge();
      },
    );

    this.transactions.startRunners();
  }

  async bootstrap() {
    try {
      await Promise.all([
        this.tableViewDefs.bootstrap(),
        this.globalCache.bootstrap(),
        this.industries.bootstrap(),
        this.settings.bootstrap(),
        this.customFields.bootstrap(),
        this.mailboxes.bootstrap(),
        this.tags.bootstrap(),
        this.opportunities.bootstrap(),
        this.emailsInbox.bootstrap(),
        this.invoices.bootstrap(),
        this.contracts.bootstrap(),
        this.externalSystemInstances.bootstrap(),
        this.users.bootstrap(),
        this.flows.bootstrap(),
        this.flowEmailVariables.bootstrap(),
        this.skus.bootstrap(),
        this.agents.bootstrap(),
        this.common.bootstrap(),
      ]);

      if (this.bootstrapIsRetrying) {
        runInAction(() => {
          this.bootstrapIsRetrying = false;
          this.bootstrapRetryCount = 0;
        });
      }
    } catch (error) {
      if (this.bootstrapRetryCount <= MAX_BOOTSTRAP_RETRIES) {
        runInAction(() => {
          this.bootstrapIsRetrying = true;
          this.bootstrapRetryCount++;
        });

        if (this.retryTimeoutId) {
          clearTimeout(this.retryTimeoutId);
        }
        this.retryTimeoutId = setTimeout(
          this.bootstrap,
          this.bootstrapRetryCount * RETRY_DELAY,
        );
      } else {
        runInAction(() => {
          if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
            this.retryTimeoutId = null;
          }
        });
        this.session.clearSession();
        window.location.href =
          '/auth/failure?message=Max%20bootstrap%20retries%20reached';
        console.error('Max bootstrap retries reached');
      }
    }
  }

  public static getInstance() {
    if (!RootStore.instance) {
      RootStore.instance = new RootStore();
    }

    return RootStore.instance;
  }

  get isAuthenticating() {
    return this.session.isLoading !== null || this.session.isBootstrapping;
  }

  get isAuthenticated() {
    return Boolean(this.session.sessionToken);
  }

  get isHydrated() {
    return (
      this.organizations.isHydrated &&
      this.tableViewDefs.isHydrated &&
      this.contacts.isHydrated
    );
  }

  get isBootstrapped() {
    return (
      this.tableViewDefs.isBootstrapped &&
      this.globalCache.isBootstrapped &&
      this.industries.isBootstrapped &&
      this.settings.isBootstrapped &&
      this.customFields.isBootstrapped &&
      this.mailboxes.isBootstrapped &&
      this.tags.isBootstrapped &&
      this.opportunities.isBootstrapped &&
      this.invoices.isBootstrapped &&
      this.contracts.isBootstrapped &&
      this.externalSystemInstances.isBootstrapped &&
      this.users.isBootstrapped &&
      this.flows.isBootstrapped &&
      this.flowEmailVariables.isBootstrapped &&
      this.skus.isBootstrapped &&
      this.agents.isBootstrapped
    );
  }

  get isBootstrapping() {
    return (
      this.tableViewDefs.isLoading ||
      this.settings.isBootstrapping ||
      this.globalCache.isLoading
    );
  }

  get isSyncing() {
    return this.organizations.isLoading;
  }
}
