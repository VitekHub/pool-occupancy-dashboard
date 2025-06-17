/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { PoolType, POOL_TYPES } from '@/utils/types/poolTypes';
import poolConfig from '@/pool_occupancy_config.json';

interface PoolConfig {
  name: string;
}

interface PoolSelectorContextType {
  selectedPoolType: PoolType;
  setselectedPoolType: (pool: PoolType) => void;
  selectedPool: string;
  setSelectedPool: (poolName: string) => void;
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
  const [selectedPoolType, setselectedPoolType] = useState<PoolType>(POOL_TYPES.INSIDE);
  const [selectedPool, setSelectedPool] = useState<string>(
    poolConfig.length > 0 ? poolConfig[0].name : ''
  );

  return (
    <PoolSelectorContext.Provider value={{ 
      selectedPoolType, 
      setselectedPoolType,
      selectedPool,
      setSelectedPool
    }}>
      {children}
    </PoolSelectorContext.Provider>
  );
};