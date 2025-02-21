import { useKeyBindings } from 'rooks';

import { useStore } from '@shared/hooks/useStore';

interface InvoicesTableActionsProps {
  focusedId: string | null;
}

export const InvoicesTableActions = ({
  focusedId,
}: InvoicesTableActionsProps) => {
  const store = useStore();

  useKeyBindings(
    {
      Space: (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (store.ui.showPreviewCard && focusedId) {
          if (focusedId === store.ui.focusRow) {
            store.ui.setShowPreviewCard(false);

            return;
          }

          store.ui.setFocusRow(focusedId);

          return;
        }

        store.ui.setShowPreviewCard(true);
      },
    },
    { when: !!focusedId },
  );

  return <></>;
};
