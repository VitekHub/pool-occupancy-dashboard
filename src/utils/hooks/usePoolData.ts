import useSWR from 'swr';
import { parseOccupancyCSV, parseCapacityCSV } from '../data/csvParser';
import { processOccupancyData } from '../data/dataProcessing';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary } from '../types/poolData';

const SWR_BASE_CONFIG = {
  revalidateOnMount: true,
  revalidateOnFocus: true
};

const CAPACITY_CONFIG = {
  ...SWR_BASE_CONFIG
};

const OCCUPANCY_CONFIG = {
  ...SWR_BASE_CONFIG,
  refreshInterval: 2 * 60 * 1000
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const text = await response.text();
  return text;
};

export const usePoolData = (selectedWeekId?: string) => {
  // Fetch occupancy data
  const { data: occupancyData, error: occupancyError } = useSWR<OccupancyRecord[]>(
    import.meta.env.VITE_POOL_OCCUPANCY_CSV_URL,
    async (url) => {
      const text = await fetcher(url);
      return parseOccupancyCSV(text);
    },
    OCCUPANCY_CONFIG
  );

  // Fetch capacity data
  const { data: capacityData, error: capacityError } = useSWR<CapacityRecord[]>(
    import.meta.env.VITE_MAX_CAPACITY_CSV_URL,
    async (url) => {
      const text = await fetcher(url);
      return parseCapacityCSV(text);
    },
    CAPACITY_CONFIG
  );

  // Process data if both are available
  const hourlySummary: HourlyOccupancySummary[] = 
    occupancyData && capacityData && selectedWeekId
      ? processOccupancyData(occupancyData, capacityData, selectedWeekId)
      : [];

  return {
    occupancyData,
    capacityData,
    hourlySummary,
    loading: !occupancyData || !capacityData,
    error: occupancyError || capacityError
  };
};