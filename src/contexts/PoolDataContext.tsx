/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePoolData } from '@/utils/hooks/usePoolData';
import { PoolDataProcessor } from '@/utils/data/dataProcessing';
import { getAvailableWeeks } from '@/utils/date/dateUtils';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary, WeekInfo } from '@/utils/types/poolData';
import { isInsidePool } from '@/utils/types/poolTypes';

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
  const [availableWeeks, setAvailableWeeks] = useState<WeekInfo[]>([]);
  const [currentOccupancy, setCurrentOccupancy] = useState<OccupancyRecord | null>(null);
  const [isProcessingData, setIsProcessingData] = useState<boolean>(true);

  const { 
    insideOccupancyData,
    outsideOccupancyData, 
    capacityData, 
    weekCapacityData,
    loading, 
    error 
  } = usePoolData();

  const { selectedPool } = usePoolSelector();

  const processWithTimeout = React.useCallback((callback: () => void) => {
    if (loading) {
      callback();
    } else {
      setIsProcessingData(true);
      setTimeout(() => {
        callback();
        setIsProcessingData(false);
      }, 200);
    }
  }, [loading]);

  // Combine occupancy data based on selected pool
  const getPoolDataProcessor = React.useCallback(() => {
    const occupancyData = isInsidePool(selectedPool) ? insideOccupancyData : outsideOccupancyData;
    const dataProcessor = new PoolDataProcessor(occupancyData || [], capacityData || [], selectedPool);
    return { dataProcessor, occupancyData };
  }, [selectedPool, insideOccupancyData, outsideOccupancyData, capacityData]);

  // Set initial week when available
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekId) {
      setSelectedWeekId(availableWeeks[0].id);
    }
  }, [availableWeeks, selectedWeekId]);

  // Reset selected week when pool changes
  useEffect(() => {
    if (availableWeeks.length > 0) {
      setSelectedWeekId(availableWeeks[0].id);
    }
  }, [availableWeeks, selectedPool]);

  // Process weekly data when selectedWeekId or selectedPool changes
  useEffect(() => {
    const { dataProcessor, occupancyData } = getPoolDataProcessor();
    if (occupancyData && capacityData && selectedWeekId) {
      const summary = dataProcessor.processOccupancyData(selectedWeekId);
      setHourlySummary(summary);
    }
  }, [selectedWeekId, insideOccupancyData, outsideOccupancyData, capacityData, selectedPool, getPoolDataProcessor]);

  // Process overall data when raw data or selectedPool changes
  useEffect(() => {
    processWithTimeout(() => {
      const { dataProcessor, occupancyData } = getPoolDataProcessor();
      if (occupancyData && capacityData) {

        const summary = dataProcessor.processOverallOccupancyData();
        setOverallHourlySummary(summary);

        // Update current occupancy
        setCurrentOccupancy(
          occupancyData.length > 0 ? occupancyData[occupancyData.length - 1] : null
        );

        // Process data for all available weeks
        const summaries: Record<string, HourlyOccupancySummary[]> = {};
        const weeks = getAvailableWeeks(occupancyData.map(record => record.date));
        setAvailableWeeks(weeks);
        
        weeks.forEach(week => {
          const weeklySummary = dataProcessor.processOccupancyData(week.id);
          summaries[week.id] = weeklySummary;
        });
        setWeeklySummaries(summaries);
      }
    });
  }, [insideOccupancyData, outsideOccupancyData, capacityData, selectedPool, processWithTimeout, getPoolDataProcessor]);

  return (
    <PoolDataContext.Provider value={{
      occupancyData: isInsidePool(selectedPool) ? insideOccupancyData : outsideOccupancyData,
      capacityData: isInsidePool(selectedPool) ? capacityData : undefined,
      weekCapacityData: isInsidePool(selectedPool) ? weekCapacityData : undefined,
      hourlySummary,
      overallHourlySummary,
      weeklySummaries,
      availableWeeks,
      currentOccupancy,
      loading: loading || isProcessingData,
      error,
      selectedWeekId,
      setSelectedWeekId
    }}>
      {children}
    </PoolDataContext.Provider>
  );
};