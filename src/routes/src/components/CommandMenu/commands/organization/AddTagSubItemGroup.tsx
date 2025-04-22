import { useMemo, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { EditOrganizationTagUsecase } from '@domain/usecases/command-menu/organization/edit-organization-tag.usecase';

import { Tag01 } from '@ui/media/icons/Tag01';
import { Check } from '@ui/media/icons/Check.tsx';
import { useStore } from '@shared/hooks/useStore';
import { CommandSubItem } from '@ui/overlay/CommandMenu';

export const AddTagSubItemGroup = observer(() => {
  const store = useStore();
  const organization = registry
    .get('organizations')
    .get(store.ui.commandMenu.context.ids?.[0] as string);
  const editTagsUsecase = useMemo(
    () => organization && new EditOrganizationTagUsecase(organization),
    [organization],
  );

  useEffect(() => {
    editTagsUsecase?.allowClose();
  }, []);

  return (
    <>
      {editTagsUsecase?.tagList?.map((tag) => (
        <CommandSubItem
          key={tag.id}
          icon={<Tag01 />}
          leftLabel='Change tag'
          rightLabel={tag.value.name}
          onSelectAction={() => {
            editTagsUsecase.select(tag.id);
          }}
          rightAccessory={
            editTagsUsecase.organizationTags.has(tag.value.name) ? (
              <Check />
            ) : null
          }
        />
      ))}
    </>
  );
});
