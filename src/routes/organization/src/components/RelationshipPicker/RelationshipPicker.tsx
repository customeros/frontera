import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { OrganizationService } from '@/domain/services/organization/organizations.service';
import { relationshipOptions } from '@finder/components/Columns/organizations/Cells/relationship/util';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Seeding } from '@ui/media/icons/Seeding';
import { BrokenHeart } from '@ui/media/icons/BrokenHeart';
import { OrganizationRelationship } from '@graphql/types';
import { SelectOption } from '@shared/types/SelectOptions.ts';
import { ActivityHeart } from '@ui/media/icons/ActivityHeart';
import { MessageXCircle } from '@ui/media/icons/MessageXCircle';
import { Tag, TagLabel, TagLeftIcon } from '@ui/presentation/Tag';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

const iconMap = {
  Customer: <ActivityHeart />,
  Prospect: <Seeding />,
  'Not a Fit': <MessageXCircle />,
  'Former Customer': <BrokenHeart />,
};

export const RelationshipPicker = observer(() => {
  const id = useParams()?.id as string;
  const organization = registry.get('organizations').get(id);
  const organizationService = useMemo(() => new OrganizationService(), []);

  const selectedValue = relationshipOptions.find(
    (option) => option.value === organization?.relationship,
  );

  const iconTag = iconMap[selectedValue?.label as keyof typeof iconMap];

  const handleSelect = (option: SelectOption<OrganizationRelationship>) => {
    if (!organization) return;

    organizationService.setRelationship(organization, option.value);
  };

  return (
    <div>
      <Menu>
        <MenuButton asChild data-test={`organization-account-relationship`}>
          <Tag
            size='md'
            variant='subtle'
            className='cursor-pointer'
            colorScheme={
              selectedValue?.value === OrganizationRelationship.Customer
                ? 'success'
                : 'grayModern'
            }
          >
            <TagLeftIcon>{iconTag}</TagLeftIcon>
            <TagLabel>{selectedValue?.label ?? 'Relationship'}</TagLabel>
          </Tag>
        </MenuButton>
        <MenuList align='start' className='min-w-[180px]'>
          {relationshipOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleSelect(option)}
              data-test={`relationship-${option.value}`}
              className={cn(
                selectedValue?.value === option.value && 'bg-grayModern-50',
              )}
            >
              {iconMap[option.label as keyof typeof iconMap]}
              {option.label}
              {selectedValue?.value === option.value && (
                <Icon name='check' className='size-4' />
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </div>
  );
});
