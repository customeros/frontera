import { useNavigate } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';

import CustomerOsLogo from '../signin/CustomerOS-logo.png';

export const FailurePage = observer(() => {
  const store = useStore();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const message = params.get('message');

  const handleClick = () => {
    store.session.clearSession();
    navigate('/auth/signin');
  };

  if (message === 'PERSONAL_EMAIL_DOMAIN') {
    return (
      <div className='h-screen w-screen flex animate-fadeIn overflow-hidden max-h-screen max-w-screen'>
        <div className='flex-1 items-center h-screen overflow-hidden'>
          <div className='h-full flex items-center justify-center relative'>
            <div className='relative flex flex-col items-center justify-center w-[450px] h-full px-6 pb-6 bg-white'>
              <div className='h-full flex items-center justify-center relative '>
                <div className='flex flex-col items-center w-[360px]'>
                  <img
                    width={264}
                    height={264}
                    alt='CustomerOS'
                    src={CustomerOsLogo}
                  />
                  <h2 className='text-grayModern-900 leading-9 font-bold text-3xl py-3 mt-[-40px] text-center'>
                    Sign in with your work email
                  </h2>
                  <p className='mb-2 text-grayModern-500 text-center'>
                    Looks like you’re trying to sign in with a personal email
                    like Gmail or Yahoo.
                  </p>
                  <p className='mb-4 text-grayModern-500 text-center'>
                    To sign in, you’ll need to use your work or company email
                    instead.
                  </p>
                  <Button className='w-full' onClick={handleClick}>
                    Go back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
