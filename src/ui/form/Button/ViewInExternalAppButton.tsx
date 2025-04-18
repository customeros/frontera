import { FC, useState, ReactElement } from 'react';

import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { getExternalUrl } from '@utils/getExternalLink';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { LinkExternal02 } from '@ui/media/icons/LinkExternal02';

export const ViewInExternalAppButton: FC<{
  icon: ReactElement;
  url?: string | null;
}> = ({ url, icon }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Tooltip label={url ? 'View in Slack' : ''}>
      <IconButton
        size='xxs'
        isDisabled={!url}
        colorScheme='grayModern'
        aria-label='View in slack'
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        variant={hovered ? 'ghost' : 'outline'}
        className='absolute right-0 border-grayModern-200 shadow-none'
        icon={
          hovered ? <LinkExternal02 className='text-grayModern-500' /> : icon
        }
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (url) {
            window.open(getExternalUrl(url), '_blank', 'noopener');
          }
        }}
      />
    </Tooltip>
  );
};
