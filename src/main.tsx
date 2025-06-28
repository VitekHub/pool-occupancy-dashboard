import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import { DataPipelineProvider } from '@/contexts/DataPipelineContext';
import { PoolSelectorProvider } from '@/contexts/PoolSelectorContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PoolSelectorProvider>
      <DataPipelineProvider>
        <App />
      </DataPipelineProvider>
    </PoolSelectorProvider>
  </StrictMode>
);
