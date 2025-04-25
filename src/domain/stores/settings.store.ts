import { runInAction } from 'mobx';
import { ObservableMap } from 'mobx';
import { Store } from '@/lib/store/store';
import { FetchPolicy, applyPolicies } from '@/lib/policy';
import { CalendarConnection } from '@domain/entities/calendarConnection.entity';
import { SettingsRepository } from '@infra/repositories/core/settings/settings.repository';

const repository = new SettingsRepository();

const store = new Store<CalendarConnection>({
  indexBy: 'email',
  cache: ObservableMap,
  mutator: runInAction,
});

const fetchPolicy = new FetchPolicy(async () => {
  const res = await repository.getConnectedStatus({
    email: '',
  });

  return new CalendarConnection(res.nylasIsConnected);
});

export const SettingsStore = applyPolicies(store, [fetchPolicy]);
