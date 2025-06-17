import useSWR from 'swr';
import { parseOccupancyCSV, parseCapacityCSV } from '../data/csvParser';
import type { OccupancyRecord, CapacityRecord } from '../types/poolData';

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
  // Fetch inside occupancy data
  const { data: insideOccupancyData, error: insideOccupancyError } = useSWR<OccupancyRecord[]>(
    import.meta.env.VITE_INSIDE_POOL_OCCUPANCY_CSV_URL,
    async (url: string) => {
      const text = await fetcher(url);
      return parseOccupancyCSV(text);
    },
    OCCUPANCY_CONFIG
  );

  // Fetch outside occupancy data
  const { data: outsideOccupancyData, error: outsideOccupancyError } = useSWR<OccupancyRecord[]>(
    import.meta.env.VITE_OUTSIDE_POOL_OCCUPANCY_CSV_URL,
    async (url: string) => {
      const text = await fetcher(url);
      return parseOccupancyCSV(text);
    },
    OCCUPANCY_CONFIG
  );

  // Fetch capacity data
  const { data: capacityData, error: capacityError } = useSWR<CapacityRecord[]>(
    import.meta.env.VITE_MAX_CAPACITY_CSV_URL,
    async (url: string) => {
      const text = await fetcher(url);
      return parseCapacityCSV(text);
    },
    CAPACITY_CONFIG
  );

  // Fetch week capacity data
  const { data: weekCapacityData, error: weekCapacityError } = useSWR<CapacityRecord[]>(
    import.meta.env.VITE_WEEK_CAPACITY_CSV_URL,
    async (url: string) => {
      const text = await fetcher(url);
      return parseCapacityCSV(text);
    },
    CAPACITY_CONFIG
  );

  return {
    insideOccupancyData,
    outsideOccupancyData,
    capacityData,
    weekCapacityData,
    loading: !insideOccupancyData || !outsideOccupancyData || !capacityData || !weekCapacityData,
    error: insideOccupancyError || outsideOccupancyError || capacityError || weekCapacityError
  };
};