import { observer } from 'mobx-react-lite';

import { cn } from '@ui/utils/cn.ts';
import { Icon } from '@ui/media/Icon';
import { useStore } from '@shared/hooks/useStore';
import { DotsVertical } from '@ui/media/icons/DotsVertical';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

interface ProductItemMenuProps {
  id: string;
  closed?: boolean;
  paused?: boolean;
  contractId: string;
  allowPausing?: boolean;
  allowAddModification?: boolean;
  handlePauseService: (paused: boolean) => void;
  handleCloseService: (isClosed: boolean) => void;
}

export const ProductItemMenu = observer(
  ({
    id,
    contractId,
    allowAddModification,
    handleCloseService,
    handlePauseService,
    allowPausing,
    paused,
  }: ProductItemMenuProps) => {
    const store = useStore();
    const contractLineItemsStore = store.contractLineItems;

    return (
      <>
        <Menu>
          <MenuButton
            className={cn(
              `flex items-center max-h-5 p-1 py-2 hover:bg-grayModern-100 rounded translate-x-2 outline:0`,
            )}
          >
            <DotsVertical className='text-grayModern-400' />
          </MenuButton>
          <MenuList align='end' side='bottom'>
            {allowAddModification ? (
              <MenuItem
                onClick={() =>
                  contractLineItemsStore?.create({
                    id,
                    contractId,
                  })
                }
              >
                <Icon
                  name={'brackets-plus'}
                  className='text-grayModern-500 group-hover:text-grayModern-700'
                />
                Add modification
              </MenuItem>
            ) : (
              <div />
            )}

            {allowPausing ? (
              <MenuItem onClick={() => handlePauseService(!paused)}>
                {paused ? (
                  <>
                    <Icon
                      name={'play-circle'}
                      className='text-grayModern-500 group-hover:text-grayModern-700'
                    />
                    Resume this product
                  </>
                ) : (
                  <>
                    <Icon
                      name={'pause-circle'}
                      className='text-grayModern-500 group-hover:text-grayModern-700'
                    />
                    Pause this product
                  </>
                )}
              </MenuItem>
            ) : (
              <div />
            )}

            <MenuItem onClick={() => handleCloseService(true)}>
              <Icon
                name='x-square'
                className='text-grayModern-500 group-hover:text-grayModern-700'
              />
              End the service
            </MenuItem>
          </MenuList>
        </Menu>
      </>
    );
  },
);
