/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePoolData } from '@/utils/hooks/usePoolData';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { DataPipeline } from '@/utils/data/pipeline';
import { isInsidePool } from '@/utils/types/poolTypes';
import type { CurrentOccupancyData } from '@/utils/data/types';

interface DataPipelineContextType {
  pipeline: DataPipeline | null;
  currentOccupancy: CurrentOccupancyData | null;
  availableWeeks: Array<{ id: string; startDate: Date; endDate: Date; displayText: string }>;
  selectedWeekId: string;
  setSelectedWeekId: (weekId: string) => void;
  loading: boolean;
  error: Error | null;
}

const DataPipelineContext = createContext<DataPipelineContextType | null>(null);

export const useDataPipeline = () => {
  const context = useContext(DataPipelineContext);
  if (!context) {
    throw new Error('useDataPipeline must be used within a DataPipelineProvider');
  }
  return context;
};

export const DataPipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [currentOccupancy, setCurrentOccupancy] = useState<CurrentOccupancyData | null>(null);

  const { 
    insideOccupancyData,
    outsideOccupancyData, 
    capacityData, 
    loading, 
    error 
  } = usePoolData();

  const { selectedPoolType, selectedPool, heatmapHighThreshold } = usePoolSelector();
  const prevPoolType = React.useRef(selectedPoolType);

  // Get the appropriate occupancy data based on pool type
  const occupancyData = isInsidePool(selectedPoolType) ? insideOccupancyData : outsideOccupancyData;

  // Create pipeline when data is available
  const pipeline = useMemo(() => {
    if (!occupancyData || !capacityData || loading) return null;
    
    return new DataPipeline(
      occupancyData,
      capacityData,
      selectedPool,
      selectedPoolType,
      heatmapHighThreshold
    );
  }, [occupancyData, capacityData, selectedPool, selectedPoolType, heatmapHighThreshold, loading]);

  // Get available weeks from pipeline
  const availableWeeks = useMemo(() => {
    if (!pipeline) return [];
    return pipeline.getAvailableWeeks();
  }, [pipeline]);

  // Set initial week when available weeks change or pool type changes
  useEffect(() => {
    const poolTypeChanged = prevPoolType.current !== selectedPoolType;
    const weekInvalid = !selectedWeekId || !availableWeeks.some(week => week.id === selectedWeekId);

    if (availableWeeks.length > 0 && (weekInvalid || poolTypeChanged)) {
      setSelectedWeekId(availableWeeks[0].id);
    }

    prevPoolType.current = selectedPoolType;
  }, [availableWeeks, selectedWeekId, selectedPoolType]);

  // Update current occupancy when pipeline changes
  useEffect(() => {
    if (pipeline) {
      const current = pipeline.getCurrentOccupancy();
      setCurrentOccupancy(current);
    } else {
      setCurrentOccupancy(null);
    }
  }, [pipeline]);

  // Update pipeline settings when they change
  useEffect(() => {
    if (pipeline) {
      pipeline.updateSettings(heatmapHighThreshold, 'cs'); // TODO: get language from i18n
    }
  }, [pipeline, heatmapHighThreshold]);

  return (
    <DataPipelineContext.Provider value={{
      pipeline,
      currentOccupancy,
      availableWeeks,
      selectedWeekId,
      setSelectedWeekId,
      loading,
      error
    }}>
      {children}
    </DataPipelineContext.Provider>
  );
};