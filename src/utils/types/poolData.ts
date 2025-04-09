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
  maximumOccupancy: number;
}

export interface HourlyOccupancySummary {
  day: string;
  hour: number;
  minOccupancy: number;
  maxOccupancy: number;
  averageOccupancy: number;
  maximumOccupancy: number;
  utilizationRate: number;
  remainingCapacity: number;
  date: Date;
}

export interface WeekInfo {
  id: string;
  startDate: Date;
  endDate: Date;
  displayText: string;
}