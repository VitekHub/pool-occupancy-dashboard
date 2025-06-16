import { parse, isWithinInterval, addDays } from 'date-fns';
import { DAYS, HOURS } from '@/constants/time';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary } from '@/utils/types/poolData';
import { getAvailableWeeks } from '@/utils/date/dateUtils';
import { getHourFromTime } from '@/utils/data/csvParser';
import { PoolType, isInsidePool } from '@/utils/types/poolTypes';
import { OUTSIDE_MAX_CAPACITY, INSIDE_MAX_CAPACITY } from '@/constants/pool';


export class PoolDataProcessor {
  constructor(
    private occupancyData: OccupancyRecord[],
    private capacityData: CapacityRecord[],
    private selectedPool: PoolType
  ) {}

  // Filter data for a specific week
  private filterDataForWeek(
    data: (OccupancyRecord | CapacityRecord)[],
    selectedWeekId: string
  ): (OccupancyRecord | CapacityRecord)[] {
    const weekStart = parse(selectedWeekId, 'yyyy-MM-dd', new Date());
    const weekEnd = addDays(weekStart, 6);
    return data.filter(record => 
      isWithinInterval(record.date, { start: weekStart, end: weekEnd })
    );
  };

  // Group occupancy records by day and hour
  private createOccupancyMap(
    selectedWeekId: string
  ): Record<string, Record<number, { values: number[], date: Date }>> {
    const occupancyMap: Record<string, Record<number, { values: number[], date: Date }>> = {};
    const filteredOccupancyData = this.filterDataForWeek(this.occupancyData, selectedWeekId) as OccupancyRecord[];

    filteredOccupancyData.forEach((record) => {
      const hour = getHourFromTime(record.time);
      
      if (!occupancyMap[record.day]) {
        occupancyMap[record.day] = {};
      }
      if (!occupancyMap[record.day][hour]) {
        occupancyMap[record.day][hour] = { values: [], date: record.date };
      }
      
      occupancyMap[record.day][hour].values.push(record.occupancy);
    });

    return occupancyMap;
  };

  // Create a lookup map for capacity data
  private createCapacityMap (
    selectedWeekId: string
  ): Record<string, Record<number, number>> {
    const capacityMap: Record<string, Record<number, number>> = {};
    const filteredCapacityData = this.filterDataForWeek(this.capacityData, selectedWeekId) as CapacityRecord[];

    filteredCapacityData.forEach((record) => {
      if (!capacityMap[record.day]) {
        capacityMap[record.day] = {};
      }
      capacityMap[record.day][parseInt(record.hour)] = record.maximumCapacity;
    });

    return capacityMap;
  };

  // Calculate statistics for a single time slot
  private calculateTimeSlotStats(
    occupancyValues: number[],
    maximumCapacity: number,
    day: string,
    hour: number,
    date: Date
  ): HourlyOccupancySummary {
    // Filter out zero values that indicate pool closure
    const activeOccupancyValues = occupancyValues.filter(val => val > 0);
    
    // If all values are zero, return zeros to indicate closure
    if (activeOccupancyValues.length === 0) {
      return {
        day,
        hour,
        minOccupancy: 0,
        maxOccupancy: 0,
        averageOccupancy: 0,
        maximumCapacity,
        utilizationRate: 0,
        remainingCapacity: maximumCapacity,
        date
      };
    }
    
    // Calculate average using only non-zero values
    const sum = activeOccupancyValues.reduce((acc, val) => acc + val, 0);
    const averageOccupancy = Math.round(sum / activeOccupancyValues.length);
    const minOccupancy = Math.min(...occupancyValues);
    const maxOccupancy = Math.max(...occupancyValues);
    const utilizationRate = Math.round((averageOccupancy / maximumCapacity) * 100);
    const remainingCapacity = maximumCapacity - averageOccupancy;

    return {
      day,
      hour,
      minOccupancy,
      maxOccupancy,
      averageOccupancy,
      maximumCapacity,
      utilizationRate,
      remainingCapacity,
      date
    };
  };

  // Calculate weekly utilization rates
  private calculateWeeklyUtilization(
    weeks: { id: string }[]
  ): Record<string, Record<string, Record<number, number>>>{
    const weeklyUtilization: Record<string, Record<string, Record<number, number>>> = {};

    weeks.forEach(week => {
      const weekId = week.id;
      const weeklyData = this.processOccupancyData(weekId);
      
      weeklyData.forEach(hourData => {
        const { day, hour, utilizationRate } = hourData;
        
        if (!weeklyUtilization[weekId]) {
          weeklyUtilization[weekId] = {};
        }
        if (!weeklyUtilization[weekId][day]) {
          weeklyUtilization[weekId][day] = {};
        }
        weeklyUtilization[weekId][day][hour] = utilizationRate;
      });
    });

    return weeklyUtilization;
  };

  // Calculate average utilization for a specific time slot across weeks
  private calculateAverageUtilization(
    day: string,
    hour: number,
    weeklyUtilization: Record<string, Record<string, Record<number, number>>>,
    weeks: { id: string }[]
  ): number {
    const nonZeroRates: number[] = [];
    
    weeks.forEach(week => {
      const rate = weeklyUtilization[week.id]?.[day]?.[hour];
      if (typeof rate === 'number' && rate > 0) {
        nonZeroRates.push(rate);
      }
    });
    
    // If no data is available, return 0 to indicate no utilization
    if (nonZeroRates.length === 0) return 0;
    
    return Math.round(nonZeroRates.reduce((sum, rate) => sum + rate, 0) / nonZeroRates.length);
  };

  private getMaxCapacityByPoolType(): number {
    return isInsidePool(this.selectedPool) ? INSIDE_MAX_CAPACITY : OUTSIDE_MAX_CAPACITY;
  }

  // Process the occupancy data to group by day and hour
  public processOccupancyData(
    selectedWeekId: string
  ): HourlyOccupancySummary[] {
    const occupancyMap = this.createOccupancyMap(selectedWeekId);
    const insideCapacityMap = isInsidePool(this.selectedPool) ? this.createCapacityMap(selectedWeekId) : {};
    
    const summary: HourlyOccupancySummary[] = [];
    Object.entries(occupancyMap).forEach(([day, hourData]) => {
      Object.entries(hourData).forEach(([hourStr, { values, date }]) => {
        const hour = parseInt(hourStr);
        
        if (values.length > 0) {
          const maximumCapacity = isInsidePool(this.selectedPool) ? (insideCapacityMap[day]?.[hour] || INSIDE_MAX_CAPACITY) : OUTSIDE_MAX_CAPACITY;
          const stats = this.calculateTimeSlotStats(values, maximumCapacity, day, hour, date);
          summary.push(stats);
        }
      });
    });

    return summary;
  };

  // Process all occupancy data to get overall patterns
  public processOverallOccupancyData(): HourlyOccupancySummary[] {
    const allDates = this.occupancyData.map(record => record.date);
    const weeks = getAvailableWeeks(allDates);
    
    const weeklyUtilization = this.calculateWeeklyUtilization(weeks);
    const hourlyOccupancySummary: HourlyOccupancySummary[] = [];

    DAYS.forEach(day => {
      HOURS.forEach(hour => {
        const averageUtilization = this.calculateAverageUtilization(day, hour, weeklyUtilization, weeks);
        const recentWeekData = this.processOccupancyData(weeks[0].id).find(data => data.day === day && data.hour === hour);
        const maximumCapacity = this.getMaxCapacityByPoolType();
        
        // Create a summary entry even if we don't have recent week data
        const summary: HourlyOccupancySummary = recentWeekData ? {
          ...recentWeekData,
          utilizationRate: averageUtilization
        } : {
          day,
          hour,
          minOccupancy: 0,
          maxOccupancy: 0,
          averageOccupancy: 0,
          maximumCapacity,
          utilizationRate: averageUtilization,
          remainingCapacity: maximumCapacity, // Full capacity remaining when no data
          date: new Date() // Current date as fallback
        };
        
        // Only add to summary if we have any utilization data
        if (averageUtilization > 0 || recentWeekData) {
          hourlyOccupancySummary.push(summary);
        }
      });
    });

    return hourlyOccupancySummary;
  };
}