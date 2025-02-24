import { ReactElement, MouseEventHandler } from 'react';

import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { CornerUpLeft } from '@ui/media/icons/CornerUpLeft';
import { CornerUpLeft2 } from '@ui/media/icons/CornerUpLeft2';
import { CornerUpRight } from '@ui/media/icons/CornerUpRight';

const REPLY_MODE = 'reply';
const REPLY_ALL_MODE = 'reply-all';
const FORWARD_MODE = 'forward';

interface TooltipButtonProps {
  label: string;
  className?: string;
  children: ReactElement;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const TooltipButton = ({ label, children, onClick }: TooltipButtonProps) => (
  <Tooltip label={label} asChild={false}>
    <IconButton
      size='xs'
      variant='ghost'
      icon={children}
      onClick={onClick}
      aria-label={label}
      color='grayModern.400'
      className='rounded-none text-sm'
    />
  </Tooltip>
);

interface ButtonsProps {
  handleModeChange: (mode: 'reply' | 'reply-all' | 'forward') => void;
}

export const ModeChangeButtons = ({ handleModeChange }: ButtonsProps) => (
  <div className='flex justify-center items-center gap-3 overflow-hidden absolute border-[1px] h-6 border-grayModern-200 rounded-[16px] min-w-[96px]grayModernt-grayMgrayModernn-25 bg-grayModern-25 translate -translate-y-[18px]'>
    <TooltipButton label='Reply' onClick={() => handleModeChange(REPLY_MODE)}>
      <CornerUpLeft color='grayModern.400' />
    </TooltipButton>
    <TooltipButton
      label='Reply all'
      onClick={() => handleModeChange(REPLY_ALL_MODE)}
    >
      <CornerUpLeft2 color='grayModern.400' />
    </TooltipButton>
    <TooltipButton
      label='Forward'
      onClick={() => handleModeChange(FORWARD_MODE)}
    >
      <CornerUpRight color='grayModern.400' />
    </TooltipButton>
  </div>
);
