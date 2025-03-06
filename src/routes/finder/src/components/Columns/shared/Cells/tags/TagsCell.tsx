import { observer } from 'mobx-react-lite';

import { Tag as TagType } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';
import { Tag, TagLabel } from '@ui/presentation/Tag';

interface ContactCardProps {
  tags: TagType[];
}

export const TagsCell = ({ tags }: ContactCardProps) => {
  return (
    <>
      {!tags?.length && (
        <p className='text-grayModern-400 truncate'>No tags set</p>
      )}

      <div className='flex '>
        {!!tags?.length && tags.length > 0 && (
          <>
            {tags.map((e) => {
              return (
                <div key={e.metadata.id} className='flex w-fit'>
                  <TagDisplay id={e.metadata.id} />
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};

export const TagDisplay = observer(({ id }: { id: string }) => {
  const store = useStore();
  const tag = store.tags.getById(id);

  return (
    <>
      <Tag
        variant='subtle'
        title={tag?.tagName}
        className='mr-1 max-w-[120px]'
        colorScheme={
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (tag?.value?.colorCode as unknown as any) ?? 'grayModern'
        }
      >
        <TagLabel className={'truncate'}>{tag?.tagName}</TagLabel>
      </Tag>
    </>
  );
});
