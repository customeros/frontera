import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { DisconnectSlackChannelUsecase } from '@domain/usecases/agents/capabilities/disconnect-slack-channel.usecase.ts';

import { Icon } from '@ui/media/Icon';
import { Button } from '@ui/form/Button/Button.tsx';
import { ConfirmDeleteDialog } from '@ui/overlay/AlertDialog/ConfirmDeleteDialog';

export const DisconnectSlackMenu = observer(() => {
  const usecase = useMemo(() => new DisconnectSlackChannelUsecase(), []);

  return (
    <>
      <Button
        size='xxs'
        variant='ghost'
        onClick={() => {
          usecase.toggleConfirmationDialog(true);
        }}
      >
        <Icon stroke={'none'} name={'dot-live-success'} />
        {'Connected'}
      </Button>
      <ConfirmDeleteDialog
        hideCloseButton
        colorScheme='error'
        isOpen={usecase.isOpen}
        label={`Disconnect Slack?`}
        confirmButtonLabel='Disconnect'
        onConfirm={() => usecase.execute()}
        onClose={() => usecase.toggleConfirmationDialog(false)}
        description='Disconnecting Slack will revoke its access to your workspace. This means that any part of the app, including agent capabilities, that relies on it will stop working.'
      />
    </>
  );
});
