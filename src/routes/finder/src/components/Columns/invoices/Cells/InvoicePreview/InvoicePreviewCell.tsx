import { useSearchParams } from 'react-router-dom';

import { Eye } from '@ui/media/icons/Eye';
import { useStore } from '@shared/hooks/useStore';

export const InvoicePreviewCell = ({ value }: { value: string }) => {
  const store = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = () => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    const currentPreview = searchParams.get('preview');

    if (currentPreview === value) {
      newSearchParams.delete('preview');
      store.ui.setShowPreviewCard(false);
    } else {
      newSearchParams.set('preview', value);
      store.ui.setShowPreviewCard(true);
      store.ui.setFocusRow(value);
    }
    setSearchParams(newSearchParams.toString());
  };

  return (
    <div
      tabIndex={0}
      role='button'
      onClick={handleClick}
      className='font-medium cursor-pointer hover:text-grayModern-900 transition-colors group flex gap-1 items-center mr-2'
    >
      <span className='truncate'>{value}</span>
      <div>
        <Eye className='hidden group-hover:flex transition-opacity text-grayModern-400 size-4' />
      </div>
    </div>
  );
};
