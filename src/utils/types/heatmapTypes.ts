export interface BaseCellData {
  color: string;
  displayText: string;
  title: string;
}

export interface BaseHeatmapGridProps {
  days: string[];
  hours: number[];
  getCellData: (day: string, hour: number) => BaseCellData;
  dayLabels?: Record<string, string>;
}

export interface ExtendedCellData extends BaseCellData {
  extraRow?: {
    text: string;
    fillRatio: number;
  };
}

export interface ExtendedHeatmapGridProps extends BaseHeatmapGridProps {
  getCellData: (day: string, hour: number) => ExtendedCellData;
  hasExtraRow?: boolean;
}