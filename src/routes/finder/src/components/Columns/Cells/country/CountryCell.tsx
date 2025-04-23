import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { Organization } from '@domain/entities';
import { registry } from '@/domain/stores/registry';
import { Contact } from '@store/Contacts/Contact.dto';

import { flags } from '@ui/media/flags';
import { useStore } from '@shared/hooks/useStore';

interface ContactNameCellProps {
  id: string;
  type?: 'contact' | 'organization';
}

export const CountryCell = observer(({ id, type }: ContactNameCellProps) => {
  const store = useStore();

  const entity = match(type)
    .with('organization', () => registry.get('organizations').get(id))
    .with('contact', () => store.contacts.getById(id))
    .otherwise(() => null);

  const country = entity?.country;

  const isEnriching = match(type)
    .with('organization', () => entity?.isEnriching)
    .with('contact', () => entity?.isEnriching)
    .otherwise(() => false);

  const alpha2 = match(type)
    .with(
      'organization',
      () => (entity as Organization)?.locations?.[0]?.countryCodeA2,
    )
    .with(
      'contact',
      () => (entity as Contact)?.value.locations?.[0]?.countryCodeA2,
    )
    .otherwise(() => null);

  if (!country) {
    return (
      <div className='text-grayModern-400'>
        {isEnriching ? 'Enriching...' : 'Not set'}
      </div>
    );
  }

  return (
    <div className='flex items-center'>
      <div className='flex items-center'>{alpha2 && flags[alpha2]}</div>
      <span className='ml-2 overflow-hidden overflow-ellipsis whitespace-nowrap'>
        {country}
      </span>
    </div>
  );
});
