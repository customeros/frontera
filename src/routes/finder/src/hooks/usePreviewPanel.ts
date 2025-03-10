import { useSearchParams } from 'react-router-dom';

import { useKeyBindings } from 'rooks';

import { TableViewType } from '@graphql/types';
import { useStore } from '@shared/hooks/useStore';

export const usePreviewPanel = () => {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const preset = searchParams?.get('preset');

  const tableViewDef = store.tableViewDefs.getById(preset ?? '1');
  const tableType =
    tableViewDef?.value?.tableType || TableViewType.Organizations;

  useKeyBindings(
    {
      Space: (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (store.ui.showPreviewCard) {
          const hasSingleSelection =
            store.ui.commandMenu.context.ids.length === 1;
          const id = store.ui.commandMenu.context.ids[0];

          if (id && id !== store.ui.focusRow && hasSingleSelection) {
            store.ui.setFocusRow(id);

            return;
          }
        }

        store.ui.setShowPreviewCard(!store.ui.showPreviewCard);
      },
    },
    {
      when:
        tableType === TableViewType.Tasks ||
        tableType === TableViewType.Organizations ||
        tableType === TableViewType.Contacts ||
        tableType === TableViewType.Opportunities ||
        tableType === TableViewType.Flow ||
        tableType === TableViewType.Invoices,
    },
  );
};
