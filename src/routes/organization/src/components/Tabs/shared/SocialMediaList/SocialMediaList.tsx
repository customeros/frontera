import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';

import { useStore } from '@shared/hooks/useStore';
import { Social } from '@shared/types/__generated__/graphql.types.ts';

import { isKnownUrl } from './util.ts';
import { SocialMediaItem } from './SocialMediaItem.tsx';

interface SocialMediaListProps {
  dataTest?: string;
  isReadOnly?: boolean;
}

export const SocialMediaList = observer(
  ({ isReadOnly }: SocialMediaListProps) => {
    const store = useStore();
    const id = useParams()?.id as string;
    const organization = registry
      .get('organizations')
      .get(id ?? store.ui.focusRow);

    if (!organization) return null;

    const filteredSocials = filterUniqueSocials(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      organization.socialMedia as any,
    );

    return (
      <div className='flex flex-wrap gap-3'>
        {filteredSocials.map((social) => (
          <div key={social.id} className='w-fit'>
            <SocialMediaItem
              social={social}
              isReadOnly={isReadOnly}
              organization={organization}
            />
          </div>
        ))}
      </div>
    );
  },
);

//this function will be moved in the BE in the future

const getSocialDomain = (url: string) => {
  if (!url || typeof url !== 'string') return null;

  return isKnownUrl(url.trim().toLowerCase()) || null;
};

const filterUniqueSocials = (socialArray = []) => {
  const uniqueSocials = new Map();

  socialArray.forEach((social: Social) => {
    if (!social || typeof social !== 'object' || !social.url) return;
    const domain = getSocialDomain(social.url);

    if (domain && !uniqueSocials.has(domain)) {
      uniqueSocials.set(domain, social);
    }
  });

  return Array.from(uniqueSocials.values());
};
