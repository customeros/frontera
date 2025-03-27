import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { cn } from '@ui/utils/cn';

export function LeftSection({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const viewMode = searchParams.get('viewMode');

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (viewMode === 'focus') {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [viewMode]);

  return (
    <div
      className={cn(
        'flex h-full w-[30rem] max-w-[30rem] transition-all duration-300 ease-in-out',
        isVisible ? 'animate-slideInRightFade' : 'animate-slideOutLeftFade',
      )}
    >
      {children}
    </div>
  );
}
