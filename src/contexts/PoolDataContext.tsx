/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePoolData } from '@/utils/hooks/usePoolData';
import PoolDataProcessor from '@/utils/data/poolDataProcessor';
import { getAvailableWeeks } from '@/utils/date/dateUtils';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary, WeekInfo, WeeklyOccupancyMap, WeeklyMaxValuesPerDayMap } from '@/utils/types/poolData';
import { isInsidePool } from '@/utils/types/poolTypes';
import CoolDataProcessor from '@/utils/data/coolDataProcessor';

interface PoolDataContextType {
  occupancyData: OccupancyRecord[] | undefined;
  capacityData: CapacityRecord[] | undefined;
  weekCapacityData: CapacityRecord[] | undefined;
  hourlySummary: HourlyOccupancySummary[];
  overallHourlySummary: HourlyOccupancySummary[];
  weeklyOccupancyMap: WeeklyOccupancyMap;
  weeklyMaxValuesPerDayMap: WeeklyMaxValuesPerDayMap;
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
  const [weeklyOccupancyMap, setWeeklyOccupancyMap] = useState<WeeklyOccupancyMap>({});
  const [weeklyMaxValuesPerDayMap, setWeeklyMaxValuesPerDayMap] = useState<WeeklyMaxValuesPerDayMap>({});
  const [weeklySummaries, setWeeklySummaries] = useState<Record<string, HourlyOccupancySummary[]>>({});
  const [currentOccupancy, setCurrentOccupancy] = useState<OccupancyRecord | null>(null);

  const { 
    insideOccupancyData,
    outsideOccupancyData, 
    capacityData, 
    weekCapacityData,
    loading, 
    error 
  } = usePoolData();

  const { selectedPoolType, selectedPool } = usePoolSelector();
  const prevPoolType = React.useRef(selectedPoolType);

  const occupancyData = isInsidePool(selectedPoolType) ? insideOccupancyData : outsideOccupancyData;

  const availableWeeks = React.useMemo(() => {
    if (!occupancyData) return [];
    return getAvailableWeeks(occupancyData.map(record => record.date));
  }, [occupancyData]);

  // Set initial week when available weeks change or pool type changes
  useEffect(() => {
    const poolTypeChanged = prevPoolType.current !== selectedPoolType;
    const weekInvalid = !selectedWeekId || !availableWeeks.some(week => week.id === selectedWeekId);

    if (availableWeeks.length > 0 && (weekInvalid || poolTypeChanged)) {
      setSelectedWeekId(availableWeeks[0].id);
    }

    prevPoolType.current = selectedPoolType;
  }, [availableWeeks, selectedWeekId, selectedPoolType]);

  // Process weekly data when selectedWeekId or selectedPoolType changes
  useEffect(() => {
    const dataProcessor = new PoolDataProcessor(occupancyData || [], capacityData || [], selectedPool, selectedPoolType);
    if (occupancyData && capacityData && selectedWeekId) {
      const summary = dataProcessor.processOccupancyData(selectedWeekId);
      setHourlySummary(summary);
    }
  }, [selectedWeekId, occupancyData, capacityData, selectedPool, selectedPoolType]);

  // Process all data when the data or selected pool changes
  useEffect(() => {
    const coolDataProcessor = new CoolDataProcessor(
      capacityData || [],
      occupancyData || [],
      selectedPool,
      selectedPoolType
    );
    const { weeklyOccupancyMap, weeklyMaxValuesPerDayMap } = coolDataProcessor.preProcessAllOccupancyData();
    setWeeklyOccupancyMap(weeklyOccupancyMap);
    setWeeklyMaxValuesPerDayMap(weeklyMaxValuesPerDayMap);
  }, [occupancyData, capacityData, selectedPool, selectedPoolType]);

  // Process overall data and weekly summaries using memoized availableWeeks
  useEffect(() => {
    if (!loading) {
      const dataProcessor = new PoolDataProcessor(occupancyData || [], capacityData || [], selectedPool, selectedPoolType);
      if (occupancyData && capacityData) {
        const summary = dataProcessor.processOverallOccupancyData();
        setOverallHourlySummary(summary);

        // Update current occupancy
        if (occupancyData.length > 0) {
          const lastOccupancyData = occupancyData[occupancyData.length - 1];
          if (new Date(lastOccupancyData.date).toDateString() === new Date().toDateString()) {
            setCurrentOccupancy(lastOccupancyData);
          } else {
            setCurrentOccupancy(null);
          }
        }

        // Process data for all available weeks using memoized availableWeeks
        const summaries: Record<string, HourlyOccupancySummary[]> = {};
        availableWeeks.forEach(week => {
          const weeklySummary = dataProcessor.processOccupancyData(week.id);
          summaries[week.id] = weeklySummary;
        });
        setWeeklySummaries(summaries);
      }
    };
  }, [occupancyData, capacityData, selectedPool, selectedPoolType, availableWeeks, loading]);

  return (
    <PoolDataContext.Provider value={{
      occupancyData,
      capacityData: isInsidePool(selectedPoolType) ? capacityData : undefined,
      weekCapacityData: isInsidePool(selectedPoolType) ? weekCapacityData : undefined,
      hourlySummary,
      overallHourlySummary,
      weeklyOccupancyMap,
      weeklyMaxValuesPerDayMap,
      weeklySummaries,
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