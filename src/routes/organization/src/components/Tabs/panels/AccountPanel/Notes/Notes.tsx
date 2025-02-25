import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { EditOrganizationNotesUsecase } from '@domain/usecases/organization-details/edit-organization-notes.usecase';

import { Icon } from '@ui/media/Icon';
import { Textarea } from '@ui/form/Textarea/Textarea';

interface NotesProps {
  id: string;
}

export const Notes = observer(({ id }: NotesProps) => {
  const editNotesUsecase = useMemo(
    () => new EditOrganizationNotesUsecase(id),
    [id],
  );

  return (
    <article className=''>
      <div className='flex items-center gap-2 mt-6 mb-1'>
        <Icon name='file-02' />
        <h1 className='text-sm font-medium'>Account notes</h1>
      </div>
      <Textarea
        size='sm'
        variant={'outline'}
        className='py-1 min-h-[72px]'
        data-test='organization-account-notes-editor'
        defaultValue={editNotesUsecase.defaultNote ?? ''}
        placeholder='Add some notes related to this account...'
        onBlur={() => {
          editNotesUsecase.execute();
        }}
        onChange={(note) => {
          editNotesUsecase.setNotes(note.target.value);
        }}
      />
    </article>
  );
});
