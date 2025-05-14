import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { OrganizationService } from '@/domain/services/organization/organizations.service';

import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { Tag, TagLabel } from '@ui/presentation/Tag/Tag';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

import { stageOptions } from '../Tabs/panels/AboutPanel/util';

export const StagePicker = observer(() => {
  const id = useParams()?.id as string;
  const organization = registry.get('organizations').get(id);
  const organizationService = useMemo(() => new OrganizationService(), []);

  const selectedStageOption = stageOptions.find(
    (option) => option.value === organization?.stage,
  );

  return (
    <Menu>
      <Tooltip label='Stage' align='start'>
        <MenuButton className='min-h-[20px] outline-none focus:outline-none'>
          <Tag size='md' variant='subtle' colorScheme='grayModern'>
            <TagLabel>{selectedStageOption?.label || 'Stage'}</TagLabel>
          </Tag>
        </MenuButton>
      </Tooltip>
      <MenuList side='bottom' align='start'>
        {stageOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              organization &&
                organizationService.setStage(organization, option.value);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
});
