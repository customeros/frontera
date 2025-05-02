import React from 'react';

import ReactDOM from 'react-dom/client';

import { BookingPage } from './routes/booking/page.tsx';

import './styles/globals.scss';
import './styles/normalization.scss';
import './styles/react-calendar.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BookingPage />
  </React.StrictMode>,
);
