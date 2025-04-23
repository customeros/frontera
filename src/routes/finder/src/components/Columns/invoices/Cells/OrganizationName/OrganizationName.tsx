import { registry } from '@domain/stores/registry';

export const OrganizationName = ({ orgId }: { orgId: string }) => {
  const orgName = registry.get('organizations').get(orgId)?.name;

  return orgName ? (
    <span>{orgName}</span>
  ) : (
    <span className='text-grayModern-400'>Does not exist</span>
  );
};
