import React, { useRef, ReactNode } from 'react';

import { TableCellTooltip } from '@ui/presentation/Table';

interface TextCellProps {
  text: string;
  dataTest?: string;
  unknownText?: string;
  leftIcon?: ReactNode;
  isEnriching?: boolean;
}

export const TextCell = ({
  text,
  leftIcon,
  unknownText = 'Not set',
  dataTest,
  isEnriching,
}: TextCellProps) => {
  const itemRef = useRef<HTMLDivElement>(null);

  if (!text)
    return (
      <div data-test={dataTest} className='text-grayModern-400 truncate'>
        {isEnriching ? 'Enriching' : `${unknownText}`}
      </div>
    );

  return (
    <TableCellTooltip
      hasArrow
      label={text}
      align='start'
      side='bottom'
      targetRef={itemRef}
    >
      <div ref={itemRef} className='flex overflow-hidden'>
        {leftIcon && <div className='mr-1'>{leftIcon}</div>}
        <div
          data-test={dataTest}
          className=' overflow-x-hidden overflow-ellipsis'
        >
          {text}
        </div>
      </div>
    </TableCellTooltip>
  );
};
