import { parse, isWithinInterval, addDays } from 'date-fns';
import { DAYS, HOURS } from '../../constants/time';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary } from '../types/poolData';
import { getWeekId, getAvailableWeeks } from '../date/dateUtils';
import { getHourFromTime } from './csvParser';

// Process the occupancy data to group by day and hour
export const processOccupancyData = (
  occupancyData: OccupancyRecord[],
  capacityData: CapacityRecord[],
  selectedWeekId: string
): HourlyOccupancySummary[] => {
  // Filter data for the selected week
  const weekStart = parse(selectedWeekId, 'yyyy-MM-dd', new Date());
  const weekEnd = addDays(weekStart, 6);
  
  const filteredOccupancyData = occupancyData.filter(record => 
    isWithinInterval(record.date, { start: weekStart, end: weekEnd })
  );
  
  const filteredCapacityData = capacityData.filter(record => 
    isWithinInterval(record.date, { start: weekStart, end: weekEnd })
  );
  
  // Group occupancy records by day and hour
  const groupedByDayAndHour: Record<string, Record<number, { values: number[], date: Date }>> = {};

  // Initialize the grouping structure
  filteredOccupancyData.forEach((record) => {
    const hour = getHourFromTime(record.time);
    if (!groupedByDayAndHour[record.day]) {
      groupedByDayAndHour[record.day] = {};
    }
    if (!groupedByDayAndHour[record.day][hour]) {
      groupedByDayAndHour[record.day][hour] = { values: [], date: record.date };
    }
    groupedByDayAndHour[record.day][hour].values.push(record.occupancy);
  });

  // Create capacity lookup map
  const capacityMap: Record<string, Record<number, number>> = {};
  filteredCapacityData.forEach((record) => {
    if (!capacityMap[record.day]) {
      capacityMap[record.day] = {};
    }
    capacityMap[record.day][parseInt(record.hour)] = record.maximumOccupancy;
  });

  // Calculate average occupancy for each day and hour
  const hourlyOccupancySummary: HourlyOccupancySummary[] = [];

  Object.keys(groupedByDayAndHour).forEach((day) => {
    Object.keys(groupedByDayAndHour[day]).forEach((hourStr) => {
      const hour = parseInt(hourStr);
      const { values: occupancyValues, date } = groupedByDayAndHour[day][hour];
      
      // Only process if we have occupancy data for this hour
      if (occupancyValues.length > 0) {
        const sum = occupancyValues.reduce((acc, val) => acc + val, 0);
        const averageOccupancy = Math.round(sum / occupancyValues.length);
        const minOccupancy = Math.min(...occupancyValues);
        const maxOccupancy = Math.max(...occupancyValues);
        
        // Get maximum occupancy for this day and hour
        const maximumOccupancy = capacityMap[day]?.[hour] || 135; // Default to 135 if not found
        
        // Calculate utilization rate as a percentage
        const utilizationRate = Math.round((averageOccupancy / maximumOccupancy) * 100);
        
        // Calculate remaining capacity
        const remainingCapacity = maximumOccupancy - averageOccupancy;
        
        hourlyOccupancySummary.push({
          day,
          hour,
          minOccupancy,
          maxOccupancy,
          averageOccupancy,
          maximumOccupancy,
          utilizationRate,
          remainingCapacity,
          date
        });
      }
    });
  });

  return hourlyOccupancySummary;
};

// Process all occupancy data to get overall patterns
export const processOverallOccupancyData = (
  occupancyData: OccupancyRecord[],
  capacityData: CapacityRecord[],
): HourlyOccupancySummary[] => {
  // First, calculate weekly utilization rates
  const weeklyUtilization: Record<string, Record<string, Record<number, number>>> = {};

  // Group data by weeks
  const allDates = occupancyData.map(record => record.date);
  const weeks = getAvailableWeeks(allDates);

  // Calculate utilization rates for each week
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

  // Calculate average utilization rates across weeks
  const hourlyOccupancySummary: HourlyOccupancySummary[] = [];

  DAYS.forEach(day => {
    HOURS.forEach(hour => {
      // Collect utilization rates for this day and hour across all weeks
      const rates: number[] = [];
      
      weeks.forEach(week => {
        const rate = weeklyUtilization[week.id]?.[day]?.[hour];
        if (typeof rate === 'number') {
          rates.push(rate);
        }
      });
      
      // Only add summary if we have data for this slot
      if (rates.length > 0) {
        const averageUtilization = Math.round(
          rates.reduce((sum, rate) => sum + rate, 0) / rates.length
        );

        // Use the most recent week's data for other metrics
        const recentWeekData = processOccupancyData(
          occupancyData,
          capacityData,
          weeks[0].id
        ).find(data => data.day === day && data.hour === hour);

        if (recentWeekData) {
          const {
            minOccupancy,
            maxOccupancy,
            maximumOccupancy,
            averageOccupancy,
            remainingCapacity,
            date
          } = recentWeekData;

          // Create summary with average utilization rate
          hourlyOccupancySummary.push({
            day,
            hour,
            minOccupancy,
            maxOccupancy,
            averageOccupancy,
            maximumOccupancy,
            utilizationRate: averageUtilization,
            remainingCapacity,
            date
          });
        }
      }
    });
  });

  return hourlyOccupancySummary;
};