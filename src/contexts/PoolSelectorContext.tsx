/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { PoolType, POOL_TYPES } from '@/utils/types/poolTypes';
import { PoolConfig } from '@/utils/types/poolConfig';
import { usePrefetchPoolsData } from '@/utils/hooks/usePrefetchPoolsData';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PoolSelectorContextType {
  selectedPoolType: PoolType;
  setSelectedPoolType: (pool: PoolType) => void;
  selectedPool: PoolConfig;
  setSelectedPool: (pool: PoolConfig) => void;
  poolConfig: PoolConfig[];
}

const PoolSelectorContext = createContext<PoolSelectorContextType | null>(null);

export const usePoolSelector = () => {
  const context = useContext(PoolSelectorContext);
  if (!context) {
    throw new Error('usePoolSelector must be used within a PoolSelectorProvider');
  }
  return context;
};

export const PoolSelectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPoolType, setSelectedPoolType] = useState<PoolType>(POOL_TYPES.OUTSIDE);
  const [selectedPool, setSelectedPool] = useState<PoolConfig>({} as PoolConfig);
  
  const { data: poolConfig, error } = useSWR<PoolConfig[]>(
    import.meta.env.VITE_POOL_OCCUPANCY_CONFIG_URL,
    fetcher
  );

  useEffect(() => {
    if (poolConfig && poolConfig.length > 0) {
      usePrefetchPoolsData(poolConfig);
      setSelectedPool(poolConfig[0]);
      setSelectedPoolType(poolConfig[0].outsidePool?.viewStats ? POOL_TYPES.OUTSIDE : POOL_TYPES.INSIDE);
    }
  }, [poolConfig]);

  if (error) return <div>Failed to load pool configuration</div>;
  if (!poolConfig) {
    return <LoadingSpinner />;
  } else {
    return (
      <PoolSelectorContext.Provider value={{ 
        selectedPoolType, 
        setSelectedPoolType,
        selectedPool,
        setSelectedPool,
        poolConfig
      }}>
        {children}
      </PoolSelectorContext.Provider>
    );
  }
};