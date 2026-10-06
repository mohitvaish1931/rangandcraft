import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { installFetchInterceptor } from './utils/api';
import './index.css';

installFetchInterceptor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
