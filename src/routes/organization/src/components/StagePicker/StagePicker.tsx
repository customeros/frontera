import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { SaveOrganizationRelationshipAndStageUsecase } from '@domain/usecases/organization-details/save-organization-relationship-and-stage.usecase';

import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { Tag, TagLabel } from '@ui/presentation/Tag/Tag';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import { OrganizationRelationship } from '@shared/types/__generated__/graphql.types';

import {
  stageOptions,
  getStageOptions,
  relationshipOptions,
} from '../Tabs/panels/AboutPanel/util';

export const StagePicker = observer(() => {
  const store = useStore();
  const id = useParams()?.id as string;
  const organization = store.organizations.value.get(id);
  const applicableStageOptions = getStageOptions(
    organization?.value?.relationship,
  );

  const saveRelationshipAndStageUsecase = useMemo(
    () => new SaveOrganizationRelationshipAndStageUsecase(id),
    [id],
  );

  const selectedRelationshipOption = relationshipOptions.find(
    (option) => option.value === organization?.value?.relationship,
  );

  const selectedStageOption = stageOptions.find(
    (option) => option.value === organization?.value?.stage,
  );

  return (
    <div>
      {selectedRelationshipOption?.value ===
        OrganizationRelationship.Prospect && (
        <Menu>
          <Tooltip label='Stage' align='start'>
            <MenuButton className='min-h-[20px] outline-none focus:outline-none'>
              <Tag size='md' variant='subtle' colorScheme='grayModern'>
                <TagLabel>{selectedStageOption?.label || 'Stage'}</TagLabel>
              </Tag>
            </MenuButton>
          </Tooltip>
          <MenuList side='bottom' align='start'>
            {applicableStageOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => {
                  saveRelationshipAndStageUsecase.execute({
                    stage: option.value,
                  });
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      )}
    </div>
  );
});
