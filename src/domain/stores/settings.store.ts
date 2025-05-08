import { runInAction } from 'mobx';
import { Store } from '@/lib/store';
import { ObservableMap } from 'mobx';
import { FetchPolicy, applyPolicies } from '@/lib/policy';
import { MeetingConfig } from '@domain/entities/meetingConfig.entity';
import { WebtrackConfig } from '@domain/entities/webtrackConfig.entity';
import { CalendarConnection } from '@domain/entities/calendarConnection.entity';
import { WebsiteTrackerRepository } from '@infra/repositories/leads/website-tracker/website-tracker.repository';

const repository = new WebsiteTrackerRepository();

export const calendarConnectionStore = new CalendarConnection();

export const meetingConfigStore = new MeetingConfig();

const store = new Store<WebtrackConfig>({
  indexBy: 'id',
  cache: ObservableMap,
  mutator: runInAction,
});

const fetchWebtrackConfig = async (id: string) => {
  const res = await repository.getWebtracker({ id });

  return new WebtrackConfig(res.webtracker ?? {});
};

const fetchPolicy = new FetchPolicy(async ({ key }) => {
  return await fetchWebtrackConfig(key as string);
});

export const webtrackConfigStore = applyPolicies(store, [fetchPolicy]);
