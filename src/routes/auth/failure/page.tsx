import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';

export const FailurePage = observer(() => {
  const store = useStore();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const message = params.get('message');

  const handleClick = () => {
    store.session.clearSession();
    navigate('/auth/signin');
  };

  return (
    <div className='flex items-center justify-center h-screen w-screen'>
      <div className='flex flex-col items-center justify-center gap-4'>
        <p>Authenthication failed.</p>
        {message && <p>{message}</p>}
        <Button onClick={handleClick}>Go back</Button>
      </div>
    </div>
  );
});
