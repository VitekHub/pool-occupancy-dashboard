import type { OccupancyRecord, CapacityRecord } from '../types/poolData';
import { parseDate } from '../date/dateUtils';

// Parse time string like "08:45:00" or "08:45" to get the hour as a number (8)
export const getHourFromTime = (timeStr: string): number => {
  const hourStr = timeStr.split(':')[0];
  return parseInt(hourStr, 10);
};

// Parse the CSV text into OccupancyRecord objects
export const parseOccupancyCSV = (csvText: string): OccupancyRecord[] => {
  const lines = csvText.trim().split('\n');
  
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
export const parseCapacityCSV = (csvText: string): CapacityRecord[] => {
  const lines = csvText.trim().split('\n');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const date = parseDate(values[0]);
    return {
      date,
      day: values[1],
      hour: values[2],
      maximumCapacity: parseInt(values[3], 10)
    };
  });
};