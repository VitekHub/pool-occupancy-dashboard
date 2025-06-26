import { HourlyDataWithRatio } from './poolData';

export interface BaseCellData {
  color: string;
  colorFillRatio: number;
  displayText: string;
  title: string;
}

export interface ProcessedHeatmapData {
  utilizationMap: Record<string, Record<number, number>>;
  ratioMap: Record<string, Record<number, HourlyDataWithRatio['ratio']>>;
  maxUtilizationPerDayMap: Record<string, number>;
}

export interface BaseHeatmapGridProps {
  days: string[];
  hours: number[];
  getCellData: (day: string, hour: number) => BaseCellData;
  dayLabels?: Record<string, string>;
}

export interface ExtendedCellData extends BaseCellData {
  openedLanes?: {
    text: string;
    fillRatio: number;
  };
  rawOccupancyColor: string;
  rawOccupancyColorFillRatio: number;
  rawOccupancyDisplayText: string;
}

export interface ExtendedHeatmapGridProps extends BaseHeatmapGridProps {
  getCellData: (day: string, hour: number) => ExtendedCellData;
  showTooltips?: boolean;
}