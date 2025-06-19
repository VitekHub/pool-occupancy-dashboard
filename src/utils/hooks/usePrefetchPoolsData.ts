import { mutate } from 'swr';
import { PoolConfig } from '@/utils/types/poolConfig';
import { parseOccupancyCSV } from '@/utils/data/csvParser';

export const usePrefetchPoolsData = (allPools: PoolConfig[]): void => {
    const baseUrl = import.meta.env.VITE_BASE_OCCUPANCY_CSV_URL;
    const fetcher = (url: string) => fetch(url).then(async res => parseOccupancyCSV(await res.text()));

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
};
