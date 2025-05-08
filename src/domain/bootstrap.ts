import { unwrap } from '@/utils/unwrap';
import { RootStore } from '@/store/root';
import { BootstrapManager } from '@/lib/boot/boot';
import { registry } from '@/domain/stores/registry';
import { OrganizationRepository } from '@/infra/repositories/core/organization';
import { OrganizationViews } from '@/domain/views/organization/organization.views';
import { SettingsRepository } from '@/infra/repositories/core/settings/settings.repository';
import { WebsiteTrackerRepository } from '@infra/repositories/leads/website-tracker/website-tracker.repository';

import { MeetingConfig } from './entities/meetingConfig.entity';
import { WebtrackConfig } from './entities/webtrackConfig.entity';
import {
  meetingConfigStore,
  webtrackConfigStore,
  calendarConnectionStore,
} from './stores/settings.store';

const organizationRepo = new OrganizationRepository();
const settingsRepo = new SettingsRepository();
const webtrackRepo = new WebsiteTrackerRepository();

const context = {
  registry,
  organizationRepo,
  settingsRepo,
  webtrackRepo,
  rootStore: RootStore.getInstance(),
};

export const bootstrapper = new BootstrapManager(context);

bootstrapper.registerStep(async (ctx) => {
  const organizationViews = new OrganizationViews(
    ctx.rootStore.tableViewDefs,
    ctx.organizationRepo,
    ctx.registry.get('organizations'),
  );

  const [_, err] = await unwrap(organizationViews.init());

  if (err) {
    console.error(
      'BootstrapManager: Error while bootstrapping OrganizationViews',
      err,
    );
  }
});

bootstrapper.registerStep(async (ctx) => {
  const [res, err] = await unwrap(
    ctx.settingsRepo.getConnectedStatus({
      email: '',
    }),
  );

  if (err) {
    console.error(
      'BootstrapManager: Error while bootstrapping SettingsStore',
      err,
    );
  }

  if (res) {
    calendarConnectionStore.set(res.nylasIsConnected);
  }
});

bootstrapper.registerStep(async (ctx) => {
  const [res, err] = await unwrap(ctx.settingsRepo.getSchedulerConfig());

  if (err) {
    console.error(
      'BootstrapManager: Error while bootstrapping MeetingConfig',
      err,
    );
  }

  if (res) {
    meetingConfigStore.set(
      res.meetingBookingEvents as Partial<MeetingConfig>[],
    );
  }
});

bootstrapper.registerStep(async (ctx) => {
  const [res, err] = await unwrap(ctx.webtrackRepo.getWebtrackers());

  if (err) {
    console.error(
      'BootstrapManager: Error while bootstrapping WebtrackConfig',
      err,
    );
  }

  if (res) {
    res.webtrackers.forEach((webtracker) => {
      webtrackConfigStore.set(webtracker.id, new WebtrackConfig(webtracker));
    });
  }
});
