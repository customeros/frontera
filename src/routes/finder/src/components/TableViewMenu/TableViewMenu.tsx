import { useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useDownloadCsv } from '@finder/components/TableViewMenu/useDownloadTableViewAsCSV';

import { TableViewType } from '@graphql/types';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Download02 } from '@ui/media/icons/Download02';

export const TableViewMenu = observer(() => {
  const { downloadCSV } = useDownloadCsv();
  const [searchParams] = useSearchParams();
  const preset = searchParams.get('preset') ?? '1';

  const store = useStore();
  const tableViewDef = store.tableViewDefs.getById(preset);
  const tableType = tableViewDef?.value?.tableType;

  const isPreset = tableViewDef?.value?.isPreset;

  if (
    !isPreset ||
    (tableType &&
      [TableViewType.Invoices, TableViewType.Flow].includes(tableType))
  ) {
    return <div className='ml-2'></div>;
  }

  return (
    <IconButton
      size='xs'
      variant='ghost'
      className={'mr-3.5'}
      onClick={downloadCSV}
      aria-label={'Download csv'}
      icon={<Download02 className='' />}
    />
  );
});
