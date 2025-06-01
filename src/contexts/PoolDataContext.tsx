/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePoolData } from '@/utils/hooks/usePoolData';
import { processOccupancyData, processOverallOccupancyData } from '@/utils/data/dataProcessing';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary, WeekInfo } from '@/utils/types/poolData';

interface PoolDataContextType {
  occupancyData: OccupancyRecord[] | undefined;
  capacityData: CapacityRecord[] | undefined;
  weekCapacityData: CapacityRecord[] | undefined;
  hourlySummary: HourlyOccupancySummary[];
  overallHourlySummary: HourlyOccupancySummary[];
  weeklySummaries: Record<string, HourlyOccupancySummary[]>;
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
  const [hourlySummary, setHourlySummary] = useState<HourlyOccupancySummary[]>([]);
  const [overallHourlySummary, setOverallHourlySummary] = useState<HourlyOccupancySummary[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<Record<string, HourlyOccupancySummary[]>>({});
  
  const { 
    occupancyData, 
    capacityData, 
    weekCapacityData,
    availableWeeks, 
    currentOccupancy, 
    loading, 
    error 
  } = usePoolData();
  
  // Set initial week when available
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekId) {
      setSelectedWeekId(availableWeeks[0].id);
    }
  }, [availableWeeks, selectedWeekId]);

  // Process weekly data when selectedWeekId changes
  useEffect(() => {
    if (occupancyData && capacityData && selectedWeekId) {
      const summary = processOccupancyData(occupancyData, capacityData, selectedWeekId);
      setHourlySummary(summary);
    }
  }, [selectedWeekId, occupancyData, capacityData]);

  // Process overall data when raw data changes
  useEffect(() => {
    if (occupancyData && capacityData) {
      const summary = processOverallOccupancyData(occupancyData, capacityData);
      setOverallHourlySummary(summary);

      // Process data for all available weeks
      const summaries: Record<string, HourlyOccupancySummary[]> = {};
      availableWeeks.forEach(week => {
        const weeklySummary = processOccupancyData(occupancyData, capacityData, week.id);
        summaries[week.id] = weeklySummary;
      });
      setWeeklySummaries(summaries);
    }
  }, [occupancyData, capacityData, availableWeeks]);

  return (
    <PoolDataContext.Provider value={{
      occupancyData,
      capacityData,
      weekCapacityData,
      hourlySummary,
      weeklySummaries,
      overallHourlySummary,
      availableWeeks,
      currentOccupancy,
      loading,
      error,
      selectedWeekId,
      setSelectedWeekId
    }}>
      {children}
    </PoolDataContext.Provider>
  );
};