// Core data types - more specific and optimized
export interface TimeSlot {
  day: string;
  hour: number;
  date: Date;
}

export interface OccupancyPoint {
  timeSlot: TimeSlot;
  occupancy: number;
  time: string; // Original time string for display
}

export interface CapacityPoint {
  timeSlot: TimeSlot;
  maximumCapacity: number;
}

// Aggregated data structures for fast lookups
export interface TimeSlotStats {
  timeSlot: TimeSlot;
  occupancy: {
    min: number;
    max: number;
    average: number;
    values: number[];
  };
  capacity: {
    maximum: number;
    utilization: number;
    remaining: number;
  };
  lanes?: {
    current: number;
    total: number;
    fillRatio: number;
  };
}

// Week-based aggregations
export interface WeekStats {
  weekId: string;
  startDate: Date;
  endDate: Date;
  timeSlots: Map<string, TimeSlotStats>; // key: "day-hour"
}

// Overall patterns across all weeks
export interface OverallStats {
  timeSlots: Map<string, {
    timeSlot: TimeSlot;
    averageUtilization: number;
    weeklyData: Array<{
      weekId: string;
      stats: TimeSlotStats | null;
    }>;
  }>;
}

// Component-specific data views
export interface HeatmapData {
  getCellData: (day: string, hour: number) => {
    utilization: number;
    occupancy: { min: number; max: number; average: number };
    capacity: number;
    color: string;
    fillRatio: number;
    tooltip: string;
  };
  maxUtilizationByDay: Map<string, number>;
  maxOccupancyByDay: Map<string, number>;
}

export interface ChartData {
  hourlyData: Array<{
    hour: string;
    average: number;
    maximum: number;
    utilization: number;
    remaining: number;
  }>;
  weekComparison: Array<{
    hour: string;
    weeks: Array<{
      weekLabel: string;
      utilization: number;
      occupancy: { min: number; max: number };
      lanes?: number;
    }>;
  }>;
}

export interface TableData {
  rows: Array<{
    hour: string;
    averageOccupancy: number;
    maximumCapacity: number;
    utilizationRate: number;
    remainingCapacity: number;
  }>;
}

export interface CurrentOccupancyData {
  timeSlot: TimeSlot;
  occupancy: number;
  capacity: number;
  utilization: number;
  time: string;
}