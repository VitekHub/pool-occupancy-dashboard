import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import { PoolDataProvider } from '@/contexts/PoolDataContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PoolDataProvider>
      <App />
    </PoolDataProvider>
  </StrictMode>
);
