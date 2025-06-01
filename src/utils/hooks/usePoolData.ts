import useSWR from 'swr';
import { parseOccupancyCSV, parseCapacityCSV } from '../data/csvParser';
import type { OccupancyRecord, CapacityRecord } from '../types/poolData';
import { getAvailableWeeks } from '../date/dateUtils';

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

export const usePoolData = () => {
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

  // Calculate available weeks and current occupancy
  const availableWeeks = occupancyData
    ? getAvailableWeeks(occupancyData.map(record => record.date))
    : [];

  const currentOccupancy = occupancyData?.length
    ? occupancyData[occupancyData.length - 1]
    : null;

  return {
    occupancyData,
    capacityData,
    availableWeeks,
    currentOccupancy,
    loading: !occupancyData || !capacityData,
    error: occupancyError || capacityError
  };
};