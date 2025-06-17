/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PoolType, POOL_TYPES } from '@/utils/types/poolTypes';
import { PoolConfig } from '@/utils/types/poolConfig';
import poolConfig from '@/pool_occupancy_config.json';

interface PoolSelectorContextType {
  selectedPoolType: PoolType;
  setSelectedPoolType: (pool: PoolType) => void;
  selectedPool: PoolConfig;
  setSelectedPool: (pool: PoolConfig) => void;
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
  const [selectedPoolType, setSelectedPoolType] = useState<PoolType>(POOL_TYPES.INSIDE);
  const [selectedPool, setSelectedPool] = useState<PoolConfig>(
    poolConfig.length > 0 ? poolConfig[0] as PoolConfig : {} as PoolConfig
  );

  // Update selectedPoolType when selectedPool changes
  useEffect(() => {
    if (selectedPool) {
      if (selectedPool.insidePool !== undefined) {
        setSelectedPoolType(POOL_TYPES.INSIDE);
      } else {
        setSelectedPoolType(POOL_TYPES.OUTSIDE);
      }
    }
  }, [selectedPool, selectedPoolType]);

  return (
    <PoolSelectorContext.Provider value={{ 
      selectedPoolType, 
      setSelectedPoolType,
      selectedPool,
      setSelectedPool
    }}>
      {children}
    </PoolSelectorContext.Provider>
  );
};