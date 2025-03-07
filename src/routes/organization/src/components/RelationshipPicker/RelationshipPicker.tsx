import { useParams } from 'react-router-dom';

import { match } from 'ts-pattern';
import { observer } from 'mobx-react-lite';
import { relationshipOptions } from '@finder/components/Columns/organizations/Cells/relationship/util';

import { cn } from '@ui/utils/cn';
import { Icon } from '@ui/media/Icon';
import { Spinner } from '@ui/feedback/Spinner';
import { useStore } from '@shared/hooks/useStore';
import { Seeding } from '@ui/media/icons/Seeding';
import { BrokenHeart } from '@ui/media/icons/BrokenHeart';
import { SelectOption } from '@shared/types/SelectOptions.ts';
import { ActivityHeart } from '@ui/media/icons/ActivityHeart';
import { MessageXCircle } from '@ui/media/icons/MessageXCircle';
import { Tag, TagLabel, TagLeftIcon } from '@ui/presentation/Tag';
import { OrganizationStage, OrganizationRelationship } from '@graphql/types';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';

const iconMap = {
  Customer: <ActivityHeart />,
  Prospect: <Seeding />,
  'Not a Fit': <MessageXCircle />,
  'Former Customer': <BrokenHeart />,
};

export const RelationshipPicker = observer(() => {
  const id = useParams()?.id as string;
  const store = useStore();
  const organization = store.organizations.value.get(id);

  const selectedValue = relationshipOptions.find(
    (option) => option.value === organization?.value?.relationship,
  );

  const spinnerFill =
    selectedValue?.value === OrganizationRelationship.Customer
      ? 'text-success-300 fill-success-500'
      : 'text-grayModern-300 fill-grayModern-500';

  const iconTag = iconMap[selectedValue?.label as keyof typeof iconMap];

  const handleSelect = (option: SelectOption<OrganizationRelationship>) => {
    if (!organization) return;

    organization.value.relationship = option.value;
    organization.value.stage = match(option.value)
      .with(OrganizationRelationship.Prospect, () => OrganizationStage.Lead)
      .with(
        OrganizationRelationship.Customer,
        () => OrganizationStage.InitialValue,
      )
      .with(
        OrganizationRelationship.NotAFit,
        () => OrganizationStage.Unqualified,
      )
      .with(
        OrganizationRelationship.FormerCustomer,
        () => OrganizationStage.Target,
      )
      .otherwise(() => undefined);

    organization.commit();
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
            <TagLeftIcon
              className={
                store.organizations.isLoading ? cn(spinnerFill) : undefined
              }
            >
              {store.organizations.isLoading ? (
                <Spinner size='xs' label='Organization loading' />
              ) : (
                iconTag
              )}
            </TagLeftIcon>
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
