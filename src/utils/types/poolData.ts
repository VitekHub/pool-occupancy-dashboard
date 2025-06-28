export interface OccupancyRecord {
  date: Date;
  day: string;
  time: string;
  occupancy: number;
  hour: number;
}

export interface CapacityRecord {
  date: Date;
  day: string;
  hour: string;
  maximumCapacity: number;
}

export interface HourlyOccupancySummary {
  day: string;
  hour: number;
  minOccupancy: number;
  maxOccupancy: number;
  averageOccupancy: number;
  maximumCapacity: number;
  utilizationRate: number;
  remainingCapacity: number;
  date: Date;
}

export interface ChartDataItem {
  hour: string;
  [key: `week${number}`]: number;
  [key: `minOccupancy${number}`]: number;
  [key: `maxOccupancy${number}`]: number;
  [key: `openedLanes${number}`]: number;
  [key: `dayLabel${number}`]: string;
}

export interface CustomBarPayload {
  hour: string;
  [key: string]: number | string;
}

export interface WeekInfo {
  id: string;
  startDate: Date;
  endDate: Date;
  displayText: string;
}

export interface HourlyOccupancySummaryWithLanes extends HourlyOccupancySummary {
  lanes?: {
    current: number;
    total: number;
    colorFillRatio: number;
  };
}


export interface WeeklyCapacityMap {
  [weekId: string]: {
    [day: string]: {
      [hour: number]: number;
    };
  };
}

export interface WeeklyOccupancyMap {
  [weekId: string]: {
    [day: string]: {
      [hour: number]: HourlyOccupancySummaryWithLanes;
      maxDayValues: {
        utilizationRate: number;
        maxOccupancy: number;
      };
    };
  };
}

export interface OverallOccupancyMap {
  [day: string]: {
    [hour: number]: {
      averageUtilizationRate: number;
    };
    maxDayValues: {
      averageUtilizationRate: number;
    };
  };
}
