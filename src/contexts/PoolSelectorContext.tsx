import React, { createContext, useContext, useState } from 'react';
import { PoolType, POOL_TYPES } from '@/utils/types/poolTypes';

interface PoolSelectorContextType {
  selectedPool: PoolType;
  setSelectedPool: (pool: PoolType) => void;
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
  const [selectedPool, setSelectedPool] = useState<PoolType>(POOL_TYPES.INSIDE);

  return (
    <PoolSelectorContext.Provider value={{ selectedPool, setSelectedPool }}>
      {children}
    </PoolSelectorContext.Provider>
  );
};