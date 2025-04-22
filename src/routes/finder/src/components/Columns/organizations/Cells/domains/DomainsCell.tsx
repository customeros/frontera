import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { OrganizationAggregate } from '@/domain/aggregates/organization.aggregate';

import { useStore } from '@shared/hooks/useStore';

interface DomainCellProps {
  organizationId: string;
}

export const DomainsCell = observer(({ organizationId }: DomainCellProps) => {
  const store = useStore();
  const organization = registry.get('organizations').get(organizationId);

  if (!organization) return null;

  const organizationAggregate = new OrganizationAggregate(organization, store);
  const domains = organizationAggregate?.primaryDomains;

  return (
    <div className='flex items-center cursor-pointer'>
      <p className='text-grayModern-700  truncate'>
        {domains?.length ? (
          <span className='truncate'>
            {domains.map((domain, index) => (
              <a
                target='_blank'
                rel='noopener noreferrer'
                href={`https://${domain}`}
                className='hover:underline'
                key={`primary-domain-${domain}`}
              >
                {domain}
                {index < domains.length - 1 && ', '}
              </a>
            ))}
          </span>
        ) : organization?.isEnriching ? (
          <span
            className='text-grayModern-400'
            data-test='organization-website-in-all-orgs-table'
          >
            Enriching...
          </span>
        ) : (
          <span
            className='text-grayModern-400'
            data-test='organization-website-in-all-orgs-table'
          >
            Not set
          </span>
        )}
      </p>
    </div>
  );
});
