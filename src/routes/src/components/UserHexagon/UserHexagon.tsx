import { observer } from 'mobx-react-lite';

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

    if (url) {
      return <ClippedImage name={name} color={color} url={url ?? ''} />;
    }

    return (
      <Tooltip hasArrow label={name}>
        <div className='flex size-7 items-center justify-center cursor-default'>
          <svg
            width='26'
            height='28'
            fill='none'
            color={color}
            viewBox='0 0 26 28'
            xmlns='http://www.w3.org/2000/svg'
            style={{
              position: 'absolute',
            }}
          >
            <path
              stroke='currentColor'
              className='rounded-full'
              fill={isCurrent ? 'currentColor' : '#FCFCFD'}
            />
          </svg>

          <p
            className='text-sm z-[2] rounded-full size-7 flex items-center justify-center'
            style={{
              color: isCurrent ? 'white' : color,
              backgroundColor: isCurrent ? color : 'white',
            }}
          >
            {getInitials(name)}
          </p>
        </div>
      </Tooltip>
    );
  },
);

const ClippedImage = ({
  name,
  color,
  url,
}: {
  url: string;
  name: string;
  color: string;
}) => {
  return (
    <Tooltip hasArrow label={name}>
      <div className='flex size-7 items-center justify-center rounded-full '>
        <Image
          src={url}
          aria-label={name}
          className={`rounded-full w-[28px] h-[28px] border`}
          style={{
            borderColor: color,
          }}
        />
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
