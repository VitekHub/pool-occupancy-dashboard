import { useState, useEffect } from 'react';

export interface OccupancyRecord {
  day: string;
  time: string;
  occupancy: number;
  hour: number;
}

export interface CapacityRecord {
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
}

// Parse time string like "08:45" to get the hour as a number (8)
const getHourFromTime = (timeStr: string): number => {
  const hourStr = timeStr.split(':')[0];
  return parseInt(hourStr, 10);
};

// Process the occupancy data to group by day and hour
export const processOccupancyData = (
  occupancyData: OccupancyRecord[],
  capacityData: CapacityRecord[]
): HourlyOccupancySummary[] => {
  // Group occupancy records by day and hour
  const groupedByDayAndHour: Record<string, Record<number, number[]>> = {};

  // Initialize the grouping structure
  occupancyData.forEach((record) => {
    const hour = getHourFromTime(record.time);
    if (!groupedByDayAndHour[record.day]) {
      groupedByDayAndHour[record.day] = {};
    }
    if (!groupedByDayAndHour[record.day][hour]) {
      groupedByDayAndHour[record.day][hour] = [];
    }
    groupedByDayAndHour[record.day][hour].push(record.occupancy);
  });

  // Create capacity lookup map
  const capacityMap: Record<string, Record<number, number>> = {};
  capacityData.forEach((record) => {
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
      const occupancyValues = groupedByDayAndHour[day][hour];
      
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
          remainingCapacity
        });
      }
    });
  });

  return hourlyOccupancySummary;
};

export const usePoolData = () => {
  const [occupancyData, setOccupancyData] = useState<OccupancyRecord[]>([]);
  const [capacityData, setCapacityData] = useState<CapacityRecord[]>([]);
  const [hourlySummary, setHourlySummary] = useState<HourlyOccupancySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch occupancy data
        const occupancyResponse = await fetch('/pool_occupancy.csv');
        const occupancyText = await occupancyResponse.text();
        
        // Fetch capacity data
        const capacityResponse = await fetch('/capacity.csv');
        const capacityText = await capacityResponse.text();
        
        // Parse CSV data
        const parsedOccupancy = parseOccupancyCSV(occupancyText);
        const parsedCapacity = parseCapacityCSV(capacityText);
        
        setOccupancyData(parsedOccupancy);
        setCapacityData(parsedCapacity);
        
        // Process data to get hourly summaries
        const summary = processOccupancyData(parsedOccupancy, parsedCapacity);
        setHourlySummary(summary);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
        console.error('Error loading data:', err);
      }
    };
    
    fetchData();
  }, []);

  return { occupancyData, capacityData, hourlySummary, loading, error };
};

// Parse the CSV text into OccupancyRecord objects
const parseOccupancyCSV = (csvText: string): OccupancyRecord[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      day: values[0],
      time: values[1],
      occupancy: parseInt(values[2], 10),
      hour: getHourFromTime(values[1])
    };
  });
};

// Parse the CSV text into CapacityRecord objects
const parseCapacityCSV = (csvText: string): CapacityRecord[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      day: values[0],
      hour: values[1],
      maximumOccupancy: parseInt(values[2], 10)
    };
  });
};