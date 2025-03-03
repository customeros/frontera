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
        <div className='flex relative size-7 items-center justify-center cursor-default'>
          <p
            className='text-sm z-[2] rounded-full size-7 flex items-center justify-center'
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
