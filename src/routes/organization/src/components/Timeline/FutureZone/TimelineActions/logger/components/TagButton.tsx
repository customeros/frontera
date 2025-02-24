import { Button } from '@ui/form/Button/Button';

interface TagButtonProps {
  tag: string;
  onTagSet: () => void;
}

export const TagButton = ({ onTagSet, tag }: TagButtonProps) => (
  <Button
    size='xs'
    onClick={onTagSet}
    color='grayModern.400'
    className='text-grayModern-400 mr-2 leading-4'
  >
    {`#${tag}`}
  </Button>
);
