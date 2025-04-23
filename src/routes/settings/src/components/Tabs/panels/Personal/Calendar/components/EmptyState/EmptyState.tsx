import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';

export const EmptyState = () => {
  const store = useStore();

  return (
    <Button
      onClick={() => {
        store.settings.oauthToken.enableCalendarSync();
      }}
    >
      Connect Calendar
    </Button>
  );
};
