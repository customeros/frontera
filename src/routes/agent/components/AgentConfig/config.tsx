import { ReactElement, ComponentType } from 'react';

import { AgentType, CapabilityType, AgentListenerEvent } from '@graphql/types';

import { ClassifyEmailThreads } from './Capabilities/ClassifyEmailThreads';
import {
  NewEmails,
  InvoicePastDue,
  NewMeetingRecording,
  NewWebSessionListener,
} from './Listeners';
import {
  ApplyTag,
  GenerateInvoice,
  ManageOnlinePayment,
  EvaluateCompanyIcpFit,
  DetectSupportWebVisit,
  SyncInvoiceToAccounting,
  SendSlackNotificationCapability,
} from './Capabilities';

type ConfigComponent = ComponentType | (() => ReactElement);

type ConfigMap = {
  [K in CapabilityType | AgentListenerEvent]?: ConfigComponent;
};
type GoalMap = {
  [K in AgentType]?: string[];
};

export const configs: ConfigMap = {
  //////////////////
  // CAPABILITIES //
  //////////////////
  [CapabilityType.IcpQualify]: EvaluateCompanyIcpFit,
  [CapabilityType.WebVisitorSendSlackNotification]:
    SendSlackNotificationCapability,
  [CapabilityType.ApplyTagToCompany]: ApplyTag,
  [CapabilityType.DetectSupportWebvisit]: DetectSupportWebVisit,
  [CapabilityType.GenerateInvoice]: GenerateInvoice,
  [CapabilityType.ProcessAutopayment]: ManageOnlinePayment,
  [CapabilityType.SyncInvoiceToAccounting]: SyncInvoiceToAccounting,
  [CapabilityType.ClassifyEmail]: ClassifyEmailThreads,
  //////////////////
  //  LISTENERS   //
  //////////////////
  [AgentListenerEvent.NewWebSession]: NewWebSessionListener,
  [AgentListenerEvent.NewMeetingRecording]: NewMeetingRecording,
  [AgentListenerEvent.InvoicePastDue]: InvoicePastDue,
  [AgentListenerEvent.NewEmail]: NewEmails,
};

export const goals: GoalMap = {
  [AgentType.WebVisitIdentifier]: ['Identify companies that visit my website'],
  [AgentType.IcpQualifier]: ['Qualify companies'],
  [AgentType.SupportSpotter]: ['Spot interactions where help might be needed'],
  [AgentType.MeetingKeeper]: ['Capture external meetings'],
  [AgentType.CashflowGuardian]: ['Get you paid'],
  [AgentType.EmailKeeper]: ['Capture commercial email conversations'],
};
