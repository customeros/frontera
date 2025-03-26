import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { UpdateAgentIconUsecase } from '@domain/usecases/agents/update-agent-icon.usecase.ts';
import { UpdateAgentColorUsecase } from '@domain/usecases/agents/update-agent-color.usecase.ts';

import { IconName } from '@ui/media/Icon';
import { IconPicker } from '@ui/form/IconPicker';

export const IconAndColorPicker = observer(() => {
  const { id } = useParams();
  const iconUsecase = useMemo(() => new UpdateAgentIconUsecase(id), [id]);
  const colorUsecase = useMemo(() => new UpdateAgentColorUsecase(id), [id]);

  return (
    <IconPicker
      onIconChange={iconUsecase.execute}
      onColorChange={colorUsecase.execute}
      color={colorUsecase.agent?.value.color ?? 'grayModern'}
      icon={(iconUsecase.agent?.value.icon as IconName) ?? 'activity'}
    />
  );
});
