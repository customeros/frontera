import { useSearchParams } from 'react-router-dom';

import { useStore } from '@shared/hooks/useStore';

export const useCurrentViewDef = () => {
  const store = useStore();
  const [searchParams] = useSearchParams();

  const preset = searchParams.get('preset');

  const tableViewDef = store.tableViewDefs.getById(preset ?? '');

  return { tableViewDef, preset };
};
