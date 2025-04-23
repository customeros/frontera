import { match } from 'ts-pattern';
import { makeAutoObservable } from 'mobx';
import { Domain } from '@/domain/objects/domain';
import { Social } from '@/domain/objects/social';
import { countryMap } from '@/assets/countries/countriesMap';
import { OrganizationDatum } from '@/infra/repositories/core/organization';

import {
  IcpFit,
  Market,
  FundingRound,
  OnboardingStatus,
  OrganizationStage,
  LastTouchpointType,
  OrganizationSaveInput,
  OrganizationRelationship,
  OpportunityRenewalLikelihood,
} from '@shared/types/__generated__/graphql.types';

export class Organization implements OrganizationDatum {
  __typename: OrganizationDatum['__typename'] = 'OrganizationUiDetails';
  id: OrganizationDatum['id'] = crypto.randomUUID();
  name: OrganizationDatum['name'] = 'Unnamed';
  notes: OrganizationDatum['notes'] = '';
  description: OrganizationDatum['description'] = '';
  market: OrganizationDatum['market'] = Market.B2B;
  website: OrganizationDatum['website'] = '';
  logoUrl: OrganizationDatum['logoUrl'] = '';
  iconUrl: OrganizationDatum['iconUrl'] = '';
  wrongIndustry: OrganizationDatum['wrongIndustry'] = false;
  public: OrganizationDatum['public'] = false;
  icpFit: OrganizationDatum['icpFit'] = IcpFit.IcpNotSet;
  icpFitReasons: OrganizationDatum['icpFitReasons'] = [];
  stage: OrganizationDatum['stage'] = OrganizationStage.Target;
  relationship: OrganizationDatum['relationship'] =
    OrganizationRelationship.Prospect;
  lastFundingRound: OrganizationDatum['lastFundingRound'] =
    FundingRound.PreSeed;
  leadSource: OrganizationDatum['leadSource'] = '';
  slackChannelId: OrganizationDatum['slackChannelId'] = '';
  employees: OrganizationDatum['employees'] = 0;
  yearFounded: OrganizationDatum['yearFounded'] = 1960;
  enrichedAt: OrganizationDatum['enrichedAt'] = null;
  enrichedFailedAt: OrganizationDatum['enrichedFailedAt'] = null;
  enrichedRequestedAt: OrganizationDatum['enrichedRequestedAt'] = null;
  ltv: OrganizationDatum['ltv'] = 0;
  hide: OrganizationDatum['hide'] = false;
  domains: OrganizationDatum['domains'] = [];
  domainsDetails: OrganizationDatum['domainsDetails'] = [];
  createdAt: OrganizationDatum['createdAt'] = new Date().toISOString();
  updatedAt: OrganizationDatum['updatedAt'] = new Date().toISOString();
  churnedAt: OrganizationDatum['churnedAt'] = null;
  customerOsId: OrganizationDatum['customerOsId'] = '';
  referenceId: OrganizationDatum['referenceId'] = '';
  renewalSummaryArrForecast: OrganizationDatum['renewalSummaryArrForecast'] =
    null;
  renewalSummaryMaxArrForecast: OrganizationDatum['renewalSummaryMaxArrForecast'] =
    null;
  renewalSummaryRenewalLikelihood: OrganizationDatum['renewalSummaryRenewalLikelihood'] =
    null;
  renewalSummaryNextRenewalAt: OrganizationDatum['renewalSummaryNextRenewalAt'] =
    '';
  onboardingStatus: OrganizationDatum['onboardingStatus'] =
    OnboardingStatus.NotApplicable;
  onboardingStatusUpdatedAt: OrganizationDatum['onboardingStatusUpdatedAt'] =
    '';
  onboardingComments: OrganizationDatum['onboardingComments'] = '';
  lastTouchPointAt: OrganizationDatum['lastTouchPointAt'] =
    new Date().toISOString();
  lastTouchPointType: OrganizationDatum['lastTouchPointType'] =
    LastTouchpointType.ActionCreated;
  contactCount: OrganizationDatum['contactCount'] = 0;
  parentId: OrganizationDatum['parentId'] = null;
  parentName: OrganizationDatum['parentName'] = null;
  contracts: OrganizationDatum['contracts'] = [];
  contacts: OrganizationDatum['contacts'] = [];
  subsidiaries: OrganizationDatum['subsidiaries'] = [];
  owner: OrganizationDatum['owner'] = null;
  tags: OrganizationDatum['tags'] = [];
  socialMedia: OrganizationDatum['socialMedia'] = [];
  locations: OrganizationDatum['locations'] = [];
  industryCode: OrganizationDatum['industryCode'] = '';
  industryName: OrganizationDatum['industryName'] = '';
  icpFitUpdatedAt: OrganizationDatum['icpFitUpdatedAt'] = null;

  constructor(data?: Partial<OrganizationDatum>) {
    if (data) {
      Object.assign(this, data);
    }

    makeAutoObservable(this);
  }

  get isEnriching(): boolean {
    return (
      this.enrichedRequestedAt && !this.enrichedAt && !this.enrichedFailedAt
    );
  }

  get country() {
    const code = this.locations?.[0]?.countryCodeA2;

    if (!code) return;

    return countryMap.get(code.toLowerCase());
  }

  get tagCount() {
    return this.tags?.length ?? 0;
  }

  setId = (id: string) => {
    this.id = id;
  };

  flagIncorrectIndustry = () => {
    this.wrongIndustry = true;
    this.bumpUpdatedAt();
  };

  setRenewalAdjustedRate = (
    renewalLikelihood: OpportunityRenewalLikelihood,
  ) => {
    const potentialAmount = this.renewalSummaryMaxArrForecast ?? 0;

    this.renewalSummaryRenewalLikelihood = renewalLikelihood;

    this.renewalSummaryArrForecast = (() => {
      switch (renewalLikelihood) {
        case OpportunityRenewalLikelihood.HighRenewal:
          return potentialAmount;
        case OpportunityRenewalLikelihood.MediumRenewal:
          return (50 / 100) * potentialAmount;
        case OpportunityRenewalLikelihood.LowRenewal:
          return (25 / 100) * potentialAmount;
        default:
          return (50 / 100) * potentialAmount;
      }
    })();
  };

  setRelationship = (relationship: OrganizationRelationship) => {
    this.relationship = relationship;
    this.stage = match(relationship)
      .with(OrganizationRelationship.Prospect, () => OrganizationStage.Lead)
      .with(
        OrganizationRelationship.Customer,
        () => OrganizationStage.InitialValue,
      )
      .with(
        OrganizationRelationship.NotAFit,
        () => OrganizationStage.Unqualified,
      )
      .with(
        OrganizationRelationship.FormerCustomer,
        () => OrganizationStage.Target,
      )
      .otherwise(() => undefined);

    this.bumpUpdatedAt();
  };

  setStage = (stage: OrganizationStage) => {
    this.stage = stage;
    this.bumpUpdatedAt();
  };

  removeStage = () => {
    this.stage = null;
    this.bumpUpdatedAt();
  };

  setNotes = (notes: string) => {
    this.notes = notes;
    this.bumpUpdatedAt();
  };

  addSocial = (url: string) => {
    this.socialMedia.push(Social.create({ url }));
    this.bumpUpdatedAt();
  };

  deleteSocial = (id: string) => {
    const index = this.socialMedia.findIndex((s) => s.id === id);

    this.socialMedia.splice(index, 1);
    this.bumpUpdatedAt();
  };

  revertSocial = (social: Social) => {
    this.socialMedia.push(social);
    this.bumpUpdatedAt();
  };

  addDomain = (payload: Partial<Domain>) => {
    this.domainsDetails.push(Domain.create(payload));
    this.bumpUpdatedAt();
  };

  deleteDomain = (domain: string) => {
    const index = this.domainsDetails.findIndex((d) => d.domain !== domain);

    this.domainsDetails.splice(index, 1);
    this.bumpUpdatedAt();
  };

  addContract = (contractId: string) => {
    this.contracts.unshift(contractId);
    this.bumpUpdatedAt();
  };

  deleteContract = (contractId: string) => {
    const index = this.contracts.indexOf(contractId);

    if (index > -1) {
      this.contracts.splice(index, 1);
    }

    this.bumpUpdatedAt();
  };

  deleteContact = (contactId: string) => {
    const index = this.contacts.indexOf(contactId);

    if (index > -1) {
      this.contacts.splice(index, 1);
    }

    this.bumpUpdatedAt();
  };

  setRenewalLikelihood = (likelihood: OpportunityRenewalLikelihood) => {
    this.renewalSummaryRenewalLikelihood = likelihood;
    this.bumpUpdatedAt();
  };

  toSaveInput = (): OrganizationSaveInput => ({
    id: this.id,
    name: this.name,
    notes: this.notes,
    stage: this.stage,
    market: this.market,
    public: this.public,
    domains: this.domains,
    iconUrl: this.iconUrl,
    logoUrl: this.logoUrl,
    ownerId: this.owner?.id,
    website: this.website,
    employees: this.employees,
    leadSource: this.leadSource,
    description: this.description,
    referenceId: this.referenceId,
    yearFounded: this.yearFounded,
    relationship: this.relationship,
    slackChannelId: this.slackChannelId,
    lastFundingRound: this.lastFundingRound,
  });

  toCreatePayload = (): OrganizationSaveInput => ({
    name: this.name,
    notes: this.notes,
    stage: this.stage,
    market: this.market,
    public: this.public,
    domains: this.domains,
    iconUrl: this.iconUrl,
    logoUrl: this.logoUrl,
    ownerId: this.owner?.id,
    website: this.website,
    employees: this.employees,
    leadSource: this.leadSource,
    description: this.description,
    referenceId: this.referenceId,
    yearFounded: this.yearFounded,
    relationship: this.relationship,
    slackChannelId: this.slackChannelId,
    lastFundingRound: this.lastFundingRound,
  });

  bumpUpdatedAt = () => {
    this.updatedAt = new Date().toISOString();
  };
}
