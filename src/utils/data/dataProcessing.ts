import { parse, isWithinInterval, addDays } from 'date-fns';
import { DAYS, HOURS } from '../../constants/time';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary } from '../types/poolData';
import { getAvailableWeeks } from '../date/dateUtils';
import { getHourFromTime } from './csvParser';

// Filter data for a specific week
const filterDataForWeek = (
  data: (OccupancyRecord | CapacityRecord)[],
  weekStart: Date,
  weekEnd: Date
) => {
  return data.filter(record => 
    isWithinInterval(record.date, { start: weekStart, end: weekEnd })
  );
};

// Group occupancy records by day and hour
const groupOccupancyByDayAndHour = (
  occupancyData: OccupancyRecord[]
): Record<string, Record<number, { values: number[], date: Date }>> => {
  const grouped: Record<string, Record<number, { values: number[], date: Date }>> = {};

  occupancyData.forEach((record) => {
    const hour = getHourFromTime(record.time);
    
    if (!grouped[record.day]) {
      grouped[record.day] = {};
    }
    if (!grouped[record.day][hour]) {
      grouped[record.day][hour] = { values: [], date: record.date };
    }
    
    grouped[record.day][hour].values.push(record.occupancy);
  });

  return grouped;
};

// Create a lookup map for capacity data
const createCapacityMap = (
  capacityData: CapacityRecord[]
): Record<string, Record<number, number>> => {
  const capacityMap: Record<string, Record<number, number>> = {};

  capacityData.forEach((record) => {
    if (!capacityMap[record.day]) {
      capacityMap[record.day] = {};
    }
    capacityMap[record.day][parseInt(record.hour)] = record.maximumOccupancy;
  });

  return capacityMap;
};

// Calculate statistics for a single time slot
const calculateTimeSlotStats = (
  occupancyValues: number[],
  maximumOccupancy: number,
  day: string,
  hour: number,
  date: Date
): HourlyOccupancySummary => {
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
      maximumOccupancy,
      utilizationRate: 0,
      remainingCapacity: maximumOccupancy,
      date
    };
  }
  
  // Calculate average using only non-zero values
  const sum = activeOccupancyValues.reduce((acc, val) => acc + val, 0);
  const averageOccupancy = Math.round(sum / activeOccupancyValues.length);
  const minOccupancy = Math.min(...occupancyValues);
  const maxOccupancy = Math.max(...occupancyValues);
  const utilizationRate = Math.round((averageOccupancy / maximumOccupancy) * 100);
  const remainingCapacity = maximumOccupancy - averageOccupancy;

  return {
    day,
    hour,
    minOccupancy,
    maxOccupancy,
    averageOccupancy,
    maximumOccupancy,
    utilizationRate,
    remainingCapacity,
    date
  };
};

// Calculate hourly summary for grouped data
const calculateHourlySummary = (
  groupedData: Record<string, Record<number, { values: number[], date: Date }>>,
  capacityMap: Record<string, Record<number, number>>
): HourlyOccupancySummary[] => {
  const summary: HourlyOccupancySummary[] = [];

  Object.entries(groupedData).forEach(([day, hourData]) => {
    Object.entries(hourData).forEach(([hourStr, { values, date }]) => {
      const hour = parseInt(hourStr);
      
      if (values.length > 0) {
        const maximumOccupancy = capacityMap[day]?.[hour] || 135;
        const stats = calculateTimeSlotStats(values, maximumOccupancy, day, hour, date);
        summary.push(stats);
      }
    });
  });

  return summary;
};

// Calculate weekly utilization rates
const calculateWeeklyUtilization = (
  occupancyData: OccupancyRecord[],
  capacityData: CapacityRecord[],
  weeks: { id: string }[]
): Record<string, Record<string, Record<number, number>>> => {
  const weeklyUtilization: Record<string, Record<string, Record<number, number>>> = {};

  weeks.forEach(week => {
    const weekId = week.id;
    const weeklyData = processOccupancyData(occupancyData, capacityData, weekId);
    
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
const calculateAverageUtilization = (
  day: string,
  hour: number,
  weeklyUtilization: Record<string, Record<string, Record<number, number>>>,
  weeks: { id: string }[]
): number => {
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

// Process the occupancy data to group by day and hour
export const processOccupancyData = (
  occupancyData: OccupancyRecord[],
  capacityData: CapacityRecord[],
  selectedWeekId: string
): HourlyOccupancySummary[] => {
  const weekStart = parse(selectedWeekId, 'yyyy-MM-dd', new Date());
  const weekEnd = addDays(weekStart, 6);
  
  const filteredOccupancyData = filterDataForWeek(occupancyData, weekStart, weekEnd);
  const filteredCapacityData = filterDataForWeek(capacityData, weekStart, weekEnd);
  
  const groupedData = groupOccupancyByDayAndHour(filteredOccupancyData as OccupancyRecord[]);
  const capacityMap = createCapacityMap(filteredCapacityData as CapacityRecord[]);
  
  return calculateHourlySummary(groupedData, capacityMap);
};

// Process all occupancy data to get overall patterns
export const processOverallOccupancyData = (
  occupancyData: OccupancyRecord[],
  capacityData: CapacityRecord[],
): HourlyOccupancySummary[] => {
  const allDates = occupancyData.map(record => record.date);
  const weeks = getAvailableWeeks(allDates);
  
  const weeklyUtilization = calculateWeeklyUtilization(occupancyData, capacityData, weeks);
  const hourlyOccupancySummary: HourlyOccupancySummary[] = [];

  DAYS.forEach(day => {
    HOURS.forEach(hour => {
      const averageUtilization = calculateAverageUtilization(day, hour, weeklyUtilization, weeks);
      const recentWeekData = processOccupancyData(
        occupancyData,
        capacityData,
        weeks[0].id
      ).find(data => data.day === day && data.hour === hour);
      
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
        maximumOccupancy: 135, // Default maximum occupancy
        utilizationRate: averageUtilization,
        remainingCapacity: 135, // Full capacity remaining when no data
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