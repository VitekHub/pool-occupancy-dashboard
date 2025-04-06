import { useState, useEffect } from 'react';
import { format, parse, startOfWeek, endOfWeek, isWithinInterval, addDays } from 'date-fns';
import { cs, enUS } from 'date-fns/locale';

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

// Parse date string in format "DD.MM.YYYY" to Date object
export const parseDate = (dateStr: string): Date => {
  return parse(dateStr, 'dd.MM.yyyy', new Date());
};

// Format week range for display based on locale
export const formatWeekRange = (startDate: Date, endDate: Date, locale: string = 'cs'): string => {
  const dateLocale = locale === 'cs' ? cs : enUS;
  const start = format(startDate, 'd. MMMM', { locale: dateLocale });
  const end = format(endDate, 'd. MMMM yyyy', { locale: dateLocale });
  return `${start} - ${end}`;
};

// Generate a unique ID for a week based on its start date
export const getWeekId = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Week starts on Monday
  return format(weekStart, 'yyyy-MM-dd');
};

// Group dates into weeks and generate week info
export const getAvailableWeeks = (dates: Date[]): WeekInfo[] => {
  const today = new Date();
  // Map to store unique weeks
  const weeksMap = new Map<string, WeekInfo>();
  
  // Process each date
  dates.forEach(date => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Week starts on Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    const weekId = getWeekId(date);
    
    if (!weeksMap.has(weekId)) {
      weeksMap.set(weekId, {
        id: weekId,
        startDate: weekStart,
        endDate: weekEnd,
        displayText: formatWeekRange(weekStart, weekEnd)
      });
    }
  });
  
  // Convert map to array, filter out future weeks, and sort by date (newest first)
  return Array.from(weeksMap.values())
    .filter(week => week.startDate <= today)
    .sort((a, b) => 
    b.startDate.getTime() - a.startDate.getTime()
  );
};

// Parse time string like "08:45:00" or "08:45" to get the hour as a number (8)
const getHourFromTime = (timeStr: string): number => {
  const hourStr = timeStr.split(':')[0];
  return parseInt(hourStr, 10);
};

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
  capacityData: CapacityRecord[]
): HourlyOccupancySummary[] => {
  // Group occupancy records by day and hour across all weeks
  const groupedByDayAndHour: Record<string, Record<number, { values: number[], dates: Date[] }>> = {};

  // Initialize the grouping structure
  occupancyData.forEach((record) => {
    const hour = getHourFromTime(record.time);
    if (!groupedByDayAndHour[record.day]) {
      groupedByDayAndHour[record.day] = {};
    }
    if (!groupedByDayAndHour[record.day][hour]) {
      groupedByDayAndHour[record.day][hour] = { values: [], dates: [] };
    }
    groupedByDayAndHour[record.day][hour].values.push(record.occupancy);
    groupedByDayAndHour[record.day][hour].dates.push(record.date);
  });

  // Create capacity lookup map - use average capacity for each day and hour
  const capacityMap: Record<string, Record<number, number>> = {};
  
  capacityData.forEach((record) => {
    const day = record.day;
    const hour = parseInt(record.hour);
    
    if (!capacityMap[day]) {
      capacityMap[day] = {};
    }
    
    if (!capacityMap[day][hour]) {
      capacityMap[day][hour] = { sum: 0, count: 0 };
    }
    
    capacityMap[day][hour].sum += record.maximumOccupancy;
    capacityMap[day][hour].count += 1;
  });
  
  // Calculate average maximum capacity
  const averageCapacityMap: Record<string, Record<number, number>> = {};
  
  Object.keys(capacityMap).forEach(day => {
    averageCapacityMap[day] = {};
    
    Object.keys(capacityMap[day]).forEach(hourStr => {
      const hour = parseInt(hourStr);
      const { sum, count } = capacityMap[day][hour];
      averageCapacityMap[day][hour] = Math.round(sum / count);
    });
  });

  // Calculate average occupancy for each day and hour
  const hourlyOccupancySummary: HourlyOccupancySummary[] = [];

  Object.keys(groupedByDayAndHour).forEach((day) => {
    Object.keys(groupedByDayAndHour[day]).forEach((hourStr) => {
      const hour = parseInt(hourStr);
      const { values: occupancyValues, dates } = groupedByDayAndHour[day][hour];
      
      // Only process if we have occupancy data for this hour
      if (occupancyValues.length > 0) {
        const sum = occupancyValues.reduce((acc, val) => acc + val, 0);
        const averageOccupancy = Math.round(sum / occupancyValues.length);
        const minOccupancy = Math.min(...occupancyValues);
        const maxOccupancy = Math.max(...occupancyValues);
        
        // Get average maximum occupancy for this day and hour
        const maximumOccupancy = averageCapacityMap[day]?.[hour] || 135; // Default to 135 if not found
        
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
          date: dates[0] // Just use the first date as a reference
        });
      }
    });
  });

  return hourlyOccupancySummary;
};

export const usePoolData = (selectedWeekId?: string) => {
  const [occupancyData, setOccupancyData] = useState<OccupancyRecord[]>([]);
  const [capacityData, setCapacityData] = useState<CapacityRecord[]>([]);
  const [hourlySummary, setHourlySummary] = useState<HourlyOccupancySummary[]>([]);
  const [overallHourlySummary, setOverallHourlySummary] = useState<HourlyOccupancySummary[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<WeekInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentOccupancy, setCurrentOccupancy] = useState<OccupancyRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch occupancy data
        const occupancyResponse = await fetch(import.meta.env.VITE_POOL_OCCUPANCY_CSV_URL || '');
        if (!occupancyResponse.ok) {
          throw new Error('Failed to load pool occupancy data');
        }
        const occupancyText = await occupancyResponse.text();
        
        // Fetch capacity data
        const capacityResponse = await fetch(import.meta.env.VITE_MAX_CAPACITY_CSV_URL || '');
        if (!capacityResponse.ok) {
          throw new Error('Failed to load capacity data');
        }
        const capacityText = await capacityResponse.text();
        
        // Parse CSV data
        const parsedOccupancy = parseOccupancyCSV(occupancyText);
        const parsedCapacity = parseCapacityCSV(capacityText);
        
        // Set current occupancy (last entry)
        if (parsedOccupancy.length > 0) {
          setCurrentOccupancy(parsedOccupancy[parsedOccupancy.length - 1]);
        }
        
        setOccupancyData(parsedOccupancy);
        setCapacityData(parsedCapacity);
        
        // Extract dates for week detection
        const allDates = [
          ...parsedOccupancy.map(record => record.date),
          ...parsedCapacity.map(record => record.date),
        ];
        
        // Get available weeks
        const weeks = getAvailableWeeks(allDates);
        setAvailableWeeks(weeks);
        
        // Process data for the overall pattern (across all weeks)
        const overallSummary = processOverallOccupancyData(parsedOccupancy, parsedCapacity);
        setOverallHourlySummary(overallSummary);
        
        // If a specific week is selected, process data for that week
        if (selectedWeekId) {
          const weeklySummary = processOccupancyData(
            parsedOccupancy, 
            parsedCapacity, 
            selectedWeekId
          );
          setHourlySummary(weeklySummary);
        } else if (weeks.length > 0) {
          // Default to the most recent week if no week is selected
          const weeklySummary = processOccupancyData(
            parsedOccupancy, 
            parsedCapacity, 
            weeks[0].id
          );
          setHourlySummary(weeklySummary);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load pool occupancy data');
        setLoading(false);
        console.error('Error loading data:', err);
      }
    };
    
    fetchData();
  }, []);

  // Set up auto-refresh every 10 minutes
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch(import.meta.env.VITE_POOL_OCCUPANCY_CSV_URL || '');
        if (!response.ok) {
          throw new Error('Failed to refresh occupancy data');
        }
        const text = await response.text();
        const parsedData = parseOccupancyCSV(text);
        
        // Update current occupancy
        if (parsedData.length > 0) {
          setCurrentOccupancy(parsedData[parsedData.length - 1]);
        }
        
        // Update occupancy data
        setOccupancyData(parsedData);
        
        // Recalculate summaries if needed
        if (selectedWeekId) {
          const summary = processOccupancyData(parsedData, capacityData, selectedWeekId);
          setHourlySummary(summary);
        }
        
        const overallSummary = processOverallOccupancyData(parsedData, capacityData);
        setOverallHourlySummary(overallSummary);
      } catch (err) {
        console.error('Error refreshing data:', err);
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(refreshInterval);
  }, [selectedWeekId, capacityData, setCurrentOccupancy, setOccupancyData, setHourlySummary, setOverallHourlySummary]);

  useEffect(() => {
    if (occupancyData.length > 0 && capacityData.length > 0 && selectedWeekId) {
      const summary = processOccupancyData(occupancyData, capacityData, selectedWeekId);
      setHourlySummary(summary);
    }
  }, [selectedWeekId, occupancyData, capacityData]);

  return { 
    occupancyData, 
    capacityData, 
    hourlySummary, 
    overallHourlySummary, 
    availableWeeks, 
    currentOccupancy,
    loading, 
    error 
  };
};

// Parse the CSV text into OccupancyRecord objects
const parseOccupancyCSV = (csvText: string): OccupancyRecord[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const date = parseDate(values[0]);
    return {
      date,
      day: values[1],
      time: values[2],
      occupancy: parseInt(values[3], 10),
      hour: getHourFromTime(values[2])
    };
  });
};

// Parse the CSV text into CapacityRecord objects
const parseCapacityCSV = (csvText: string): CapacityRecord[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const date = parseDate(values[0]);
    return {
      date,
      day: values[1],
      hour: values[2],
      maximumOccupancy: parseInt(values[3], 10)
    };
  });
};