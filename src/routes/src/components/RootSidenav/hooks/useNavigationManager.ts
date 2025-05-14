import { useNavigate, useSearchParams } from 'react-router-dom';

import { useLocalStorage } from 'usehooks-ts';

export const useNavigationManager = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lastActivePosition, setLastActivePosition] = useLocalStorage(
    'customeros-player-last-position',
    { root: 'finder' },
  );

  const [lastSearchForPreset, setLastSearchForPreset] = useLocalStorage<{
    [key: string]: string;
  }>(`customeros-last-search-for-preset`, { root: 'root' });

  const handleItemClick = (path: string) => {
    const preset = searchParams.get('preset');

    setLastActivePosition({ ...lastActivePosition, root: path });

    if (preset) {
      const search = searchParams.get('search');

      setLastSearchForPreset({
        ...lastSearchForPreset,
        [preset]: search ?? '',
      });
    }
    navigate(`/${path}`);
  };

  const checkIsActive = (
    path: string[],
    options?: { preset: string | Array<string> },
  ) => {
    const presetParam =
      searchParams.get('preset') || lastActivePosition.root.split('=')?.[1];

    const lastActivePath = lastActivePosition.root.split('?')?.[0];

    const lastActivePreset = lastActivePosition.root.split('=')?.[1];

    const isCorrectPath = path.includes(`${lastActivePath}`);

    if (options?.preset) {
      if (Object.keys(options.preset).length > 0) {
        return (
          isCorrectPath &&
          (options.preset.includes(presetParam ?? '') ||
            options.preset.includes(lastActivePreset ?? ''))
        );
      } else {
        return (
          isCorrectPath &&
          (presetParam === options.preset ||
            lastActivePreset === options.preset)
        );
      }
    } else {
      return isCorrectPath && !presetParam;
    }
  };

  return { handleItemClick, checkIsActive, lastActivePosition };
};
