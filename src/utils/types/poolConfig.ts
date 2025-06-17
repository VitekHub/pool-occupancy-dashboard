export interface PoolConfig {
  name: string;
  insidePool?: {
    url: string;
    pattern: string;
    csvFile: string;
    maximumCapacity: number;
    totalLanes?: number;
    collectStats: boolean;
    viewStats: boolean;
  };
  outsidePool?: {
    url: string;
    pattern: string;
    csvFile: string;
    maximumCapacity: number;
    collectStats: boolean;
    viewStats: boolean;
  };
}