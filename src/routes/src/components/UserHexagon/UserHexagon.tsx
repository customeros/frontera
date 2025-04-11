import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn';
import { Image } from '@ui/media/Image/Image';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
interface UserHexagonProps {
  id: string;
  name: string;
  color: string;
  isCurrent?: boolean;
}

export const UserHexagon = observer(
  ({ name, isCurrent, color, id }: UserHexagonProps) => {
    const store = useStore();

    const url = store.users.getById(id)?.value?.profilePhotoUrl;

    const navigate = useNavigate();

    if (url && url?.length > 0) {
      return (
        <ClippedImage
          name={name}
          color={color}
          url={url ?? ''}
          isCurrent={isCurrent ?? false}
        />
      );
    }

    return (
      <Tooltip hasArrow label={name}>
        <div
          className={cn(
            'flex relative size-7 items-center justify-center cursor-default',
            isCurrent && 'cursor-pointer',
          )}
        >
          <p
            className={cn(
              'text-sm z-[2] rounded-full size-7 flex items-center justify-center',
            )}
            onClick={() => {
              if (isCurrent) {
                navigate(`/settings/?tab=profile`);
              }
            }}
            style={{
              color: isCurrent ? 'white' : color,
              backgroundColor: isCurrent ? color : 'white',
              border: !isCurrent ? `1px solid ${color}` : 'none',
            }}
          >
            {getInitials(name)}
          </p>
          <div className='absolute size-[7px] ring-[2px] ring-white bg-success-500 rounded-full right-0.5 bottom-[-1px] z-[3]'></div>
        </div>
      </Tooltip>
    );
  },
);

const ClippedImage = ({
  name,
  color,
  url,
  isCurrent,
}: {
  url: string;
  name: string;
  color: string;
  isCurrent: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <Tooltip hasArrow label={name}>
      <div
        onClick={() => {
          if (isCurrent) {
            navigate(`/settings/?tab=profile`);
          }
        }}
        className={cn(
          'flex size-7 items-center justify-center rounded-full relative cursor-default',
          isCurrent && 'cursor-pointer',
        )}
      >
        <Image
          src={url}
          aria-label={name}
          style={{
            borderColor: color,
          }}
          className={`rounded-full size-[28px] border aspect-square object-cover`}
        />

        <div className='absolute size-[7px] ring-[2px] ring-white bg-success-500 rounded-full right-0.5 bottom-[-1px] z-[3]'></div>
      </div>
    </Tooltip>
  );
};

function getInitials(name: string) {
  const temp = name.toUpperCase().split(' ').splice(0, 2);

  return temp
    .map((s) => s[0])
    .join('')
    .trim();
}
