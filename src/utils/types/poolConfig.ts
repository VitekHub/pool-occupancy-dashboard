interface PoolTypeConfig {
  customName?: string;
  url: string;
  pattern: string;
  csvFile: string;
  maximumCapacity: number;
  totalLanes?: number;
  weekdaysOpeningHours: string;
  weekendOpeningHours: string;
  collectStats: boolean;
  viewStats: boolean;
  temporarilyClosed?: string;
}

export interface PoolConfig {
  name: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  insidePool?: PoolTypeConfig;
  outsidePool?: Omit<PoolTypeConfig, 'totalLanes'>;
}
