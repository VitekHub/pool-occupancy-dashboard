export interface BaseCellData {
  color: string;
  colorFillRatio: number;
  displayText: string;
  title: string;
}

export interface ExtendedCellData extends BaseCellData {
  openedLanes?: {
    color: string;
    colorFillRatio: number;
    displayText: string;
  };
  rawOccupancy?: {
    color: string;
    colorFillRatio: number;
    displayText: string;
  };
}

export interface BaseHeatmapGridProps {
  days: string[];
  hours: number[];
  getCellData: (day: string, hour: number) => BaseCellData;
  dayLabels?: Record<string, string>;
}

export interface ExtendedHeatmapGridProps extends BaseHeatmapGridProps {
  getCellData: (day: string, hour: number) => ExtendedCellData;
  showTooltips?: boolean;
}