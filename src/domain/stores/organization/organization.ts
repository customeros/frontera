import { OrganizationDatum } from '@/infra/repositories/core/organization';

import {
  IcpFit,
  Market,
  FundingRound,
  OnboardingStatus,
  OrganizationStage,
  LastTouchpointType,
  OrganizationRelationship,
} from '@shared/types/__generated__/graphql.types';

export class Organization implements OrganizationDatum {
  id = crypto.randomUUID();
  name = 'Unnamed';
  notes = '';
  description = '';
  industry = '';
  market = Market.B2B;
  website = '';
  logoUrl = '';
  iconUrl = '';
  wrongIndustry = false;
  public = false;
  icpFit = IcpFit.IcpNotSet;
  icpFitReasons = [];
  stage = OrganizationStage.Target;
  relationship = OrganizationRelationship.Prospect;
  lastFundingRound = FundingRound.PreSeed;
  leadSource = '';
  valueProposition = '';
  slackChannelId = '';
  employees = 0;
  yearFounded = '';
  enrichedAt = null;
  enrichedFailedAt = null;
  enrichedRequestedAt = null;
  ltv = 0;
  hide = false;
  domains = [];
  domainsDetails = [];
  createdAt = new Date().toISOString();
  updatedAt = new Date().toISOString();
  churnedAt = null;
  customerOsId = '';
  referenceId = '';
  renewalSummaryArrForecast = null;
  renewalSummaryMaxArrForecast = null;
  renewalSummaryRenewalLikelihood = null;
  renewalSummaryNextRenewalAt = '';
  onboardingStatus = OnboardingStatus.NotApplicable;
  onboardingStatusUpdatedAt = '';
  onboardingComments = '';
  lastTouchPointAt = new Date().toISOString();
  lastTouchPointType = LastTouchpointType.ActionCreated;
  contactCount = 0;
  parentId = null;
  parentName = null;
  contracts = [];
  contacts = [];
  subsidiaries = [];
  owner = null;
  tags = [];
  socialMedia = [];
  locations = [];

  constructor(data?: Partial<OrganizationDatum>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
