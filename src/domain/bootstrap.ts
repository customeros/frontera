import { unwrap } from '@/utils/unwrap';
import { RootStore } from '@/store/root';
import { BootstrapManager } from '@/lib/boot/boot';
import { registry } from '@/domain/stores/registry';
import { OrganizationRepository } from '@/infra/repositories/core/organization';
import { OrganizationViews } from '@/domain/views/organization/organization.views';

const organizationRepo = new OrganizationRepository();

const context = {
  registry,
  organizationRepo,
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
