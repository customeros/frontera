import { useStore } from '@shared/hooks/useStore';

export const OrganizationName = ({ orgId }: { orgId: string }) => {
  const store = useStore();
  const orgName = store.organizations.value.get(orgId)?.value?.name;

  return orgName ? (
    <span>{orgName}</span>
  ) : (
    <span className='text-grayModern-400'>Does not exist</span>
  );
};
