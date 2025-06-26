import useSWR from 'swr';
import { parseOccupancyCSV, parseCapacityCSV } from '../data/csvParser';
import type { OccupancyRecord, CapacityRecord } from '../types/poolData';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';

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

const useOccupancyDataFetcher = (csvUrl: string | undefined): { data: OccupancyRecord[]; error: Error | null } => {
  // Always call useSWR, but pass null as key when csvUrl is undefined
  const swrKey = csvUrl ? new URL(csvUrl, import.meta.env.VITE_BASE_OCCUPANCY_CSV_URL).href : null;
  
  const { data, error } = useSWR<OccupancyRecord[]>(
    swrKey,
    async (url: string) => {
      const text = await fetcher(url);
      return parseOccupancyCSV(text);
    },
    OCCUPANCY_CONFIG
  );
  
  return { 
    data: data || [] as OccupancyRecord[], 
    error 
  };
}

const useCapacityDataFetcher = (fullUrl: string | undefined): { data: CapacityRecord[]; error: Error | null } => {
  // Always call useSWR, but pass null as key when fullUrl is undefined
  const swrKey = fullUrl || null;
  
  const { data, error } = useSWR<CapacityRecord[]>(
    swrKey,
    async (url: string) => {
      const text = await fetcher(url);
      return parseCapacityCSV(text);
    },
    CAPACITY_CONFIG
  );
  
  return { 
    data: data || [] as CapacityRecord[], 
    error 
  };
}

export const usePoolData = () => {
  const { selectedPool } = usePoolSelector();
  const { data: insideOccupancyData, error: insideOccupancyError } = useOccupancyDataFetcher(selectedPool.insidePool?.csvFile);
  const { data: outsideOccupancyData, error: outsideOccupancyError } = useOccupancyDataFetcher(selectedPool.outsidePool?.csvFile);
  const { data: capacityData, error: capacityError } = useCapacityDataFetcher(import.meta.env.VITE_MAX_CAPACITY_CSV_URL);
  const { data: weekCapacityData, error: weekCapacityError } = useCapacityDataFetcher(import.meta.env.VITE_WEEK_CAPACITY_CSV_URL);

  return {
    insideOccupancyData,
    outsideOccupancyData,
    capacityData,
    weekCapacityData,
    loading: !insideOccupancyData || !outsideOccupancyData || !capacityData || !weekCapacityData,
    error: insideOccupancyError || outsideOccupancyError || capacityError || weekCapacityError
  };
};