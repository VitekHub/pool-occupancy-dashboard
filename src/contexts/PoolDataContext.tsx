import React, { createContext, useContext } from 'react';
import { usePoolData } from '@/utils/hooks/usePoolData';
import { useState, useEffect } from 'react';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary, WeekInfo } from '@/utils/types/poolData';

interface PoolDataContextType {
  occupancyData: OccupancyRecord[] | undefined;
  capacityData: CapacityRecord[] | undefined;
  hourlySummary: HourlyOccupancySummary[];
  overallHourlySummary: HourlyOccupancySummary[];
  availableWeeks: WeekInfo[];
  currentOccupancy: OccupancyRecord | null;
  loading: boolean;
  error: Error | null;
  selectedWeekId: string;
  setSelectedWeekId: (weekId: string) => void;
}

const PoolDataContext = createContext<PoolDataContextType | null>(null);

export const usePoolDataContext = () => {
  const context = useContext(PoolDataContext);
  if (!context) {
    throw new Error('usePoolDataContext must be used within a PoolDataProvider');
  }
  return context;
};

export const PoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const poolData = usePoolData(selectedWeekId);
  
  // Set initial week when available
  useEffect(() => {
    if (poolData.availableWeeks.length > 0 && !selectedWeekId) {
      setSelectedWeekId(poolData.availableWeeks[0].id);
    }
  }, [poolData.availableWeeks, selectedWeekId]);

  return (
    <PoolDataContext.Provider value={{
      ...poolData,
      selectedWeekId,
      setSelectedWeekId
    }}>
      {children}
    </PoolDataContext.Provider>
  );
};