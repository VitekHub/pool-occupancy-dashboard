export interface PoolConfig {
  name: string;
  insidePool?: {
    customName?: string;
    url: string;
    pattern: string;
    csvFile: string;
    maximumCapacity: number;
    totalLanes: number;
    collectStats: boolean;
    viewStats: boolean;
  };
  outsidePool?: {
    customName?: string;
    url: string;
    pattern: string;
    csvFile: string;
    maximumCapacity: number;
    collectStats: boolean;
    viewStats: boolean;
  };
}