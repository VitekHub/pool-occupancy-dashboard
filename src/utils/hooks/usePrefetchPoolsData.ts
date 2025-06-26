import { useEffect } from 'react';
import { mutate } from 'swr';
import { PoolConfig } from '@/utils/types/poolConfig';
import { parseOccupancyCSV } from '@/utils/data/csvParser';

export const usePrefetchPoolsData = (allPools: PoolConfig[] | undefined): void => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_BASE_OCCUPANCY_CSV_URL;
    const fetcher = (url: string) => fetch(url).then(async res => parseOccupancyCSV(await res.text()));

    if (!allPools || allPools.length === 0) {
      return;
    }
    allPools.forEach(pool => {
      if (pool.insidePool) {
        const csvUrl = new URL(pool.insidePool.csvFile, baseUrl).href;
        mutate(csvUrl, fetcher(csvUrl), false);
      }
      if (pool.outsidePool) {
        const csvUrl = new URL(pool.outsidePool.csvFile, baseUrl).href;
        mutate(csvUrl, fetcher(csvUrl), false);
      }
    });
  }, [allPools]);
};
