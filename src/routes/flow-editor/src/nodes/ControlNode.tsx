import { XSquare } from '@ui/media/icons/XSquare.tsx';

import { Handle } from '../components';

export const ControlNode = () => {
  return (
    <div className='max-w-[156px] h-[56px] flex bg-white border border-grayModern-300 p-4 rounded-lg items-center cursor-pointer'>
      <div className='size-6 mr-2 bg-grayModern-50 border border-grayModern-100 rounded flex items-center justify-center'>
        <XSquare className='text-grayModern-500' />
      </div>
      <span className='text-sm' data-test={'flow-end-flow'}>
        End Flow
      </span>
      <Handle
        type='target'
        className={`h-2 w-2 bg-transparent border-transparent`}
      />
    </div>
  );
};
