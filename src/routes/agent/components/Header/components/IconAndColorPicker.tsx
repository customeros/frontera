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
      colorsMap={colorMap}
      onIconChange={iconUsecase.execute}
      onColorChange={colorUsecase.execute}
      iconOptions={iconUsecase.iconOptions}
      onIconSearch={iconUsecase.setSearchQuery}
      iconSearchValue={iconUsecase.searchQuery}
      color={colorUsecase.agent?.value.color ?? 'grayModern'}
      icon={(iconUsecase.agent?.value.icon as IconName) ?? 'activity'}
    />
  );
});

const colorMap = {
  grayModern: 'bg-grayModern-400 ring-grayModern-400',
  error: 'bg-error-400 ring-error-400',
  warning: 'bg-warning-400 ring-warning-400',
  success: 'bg-success-400 ring-success-400',
  grayWarm: 'bg-grayWarm-400 ring-grayWarm-400',
  moss: 'bg-moss-400 ring-moss-400',
  blueLight: 'bg-blueLight-400 ring-blueLight-400',
  indigo: 'bg-indigo-400 ring-indigo-400',
  violet: 'bg-violet-400 ring-violet-400',
  pink: 'bg-pink-400 ring-pink-400',
};
