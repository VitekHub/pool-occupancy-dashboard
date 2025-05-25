import { useState, useEffect } from 'react';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary, WeekInfo } from '../types/poolData';
import { parseOccupancyCSV, parseCapacityCSV } from '../data/csvParser';
import { processOccupancyData } from '../data/dataProcessing';
import { getAvailableWeeks } from '../date/dateUtils';

interface MultiWeekData {
  weeklySummaries: Record<string, HourlyOccupancySummary[]>;
  weekCapacityData: CapacityRecord[];
  availableWeeks: WeekInfo[];
  loading: boolean;
  error: string | null;
}

export const useMultiWeekData = (): MultiWeekData => {
  const [weeklySummaries, setWeeklySummaries] = useState<Record<string, HourlyOccupancySummary[]>>({});
  const [weekCapacityData, setWeekCapacityData] = useState<CapacityRecord[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<WeekInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [occupancyResponse, capacityResponse, weekCapacityResponse] = await Promise.all([
          fetch(import.meta.env.VITE_POOL_OCCUPANCY_CSV_URL || ''),
          fetch(import.meta.env.VITE_MAX_CAPACITY_CSV_URL || ''),
          fetch(import.meta.env.VITE_WEEK_CAPACITY_CSV_URL || '')
        ]);

        // Check responses
        if (!occupancyResponse.ok) {
          throw new Error('Failed to load pool occupancy data');
        }
        if (!capacityResponse.ok) {
          throw new Error('Failed to load capacity data');
        }
        if (!weekCapacityResponse.ok) {
          throw new Error('Failed to load week capacity data');
        }

        // Get text content in parallel
        const [occupancyText, capacityText, weekCapacityText] = await Promise.all([
          occupancyResponse.text(),
          capacityResponse.text(),
          weekCapacityResponse.text()
        ]);

        // Parse CSV data
        const parsedOccupancy = parseOccupancyCSV(occupancyText);
        const parsedCapacity = parseCapacityCSV(capacityText);
        const parsedWeekCapacity = parseCapacityCSV(weekCapacityText);

        // Get all dates for week detection
        const allDates = [
          ...parsedOccupancy.map(record => record.date),
          ...parsedCapacity.map(record => record.date),
        ];
        
        // Get available weeks
        const weeks = getAvailableWeeks(allDates);
        setAvailableWeeks(weeks);

        // Process data for each week
        const summaries: Record<string, HourlyOccupancySummary[]> = {};
        weeks.forEach(week => {
          const weeklySummary = processOccupancyData(
            parsedOccupancy,
            parsedCapacity,
            week.id
          );
          summaries[week.id] = weeklySummary;
        });

        setWeeklySummaries(summaries);
        setWeekCapacityData(parsedWeekCapacity);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setLoading(false);
        console.error('Error loading multi-week data:', err);
      }
    };

    fetchData();
  }, []);

  return {
    weeklySummaries,
    weekCapacityData,
    availableWeeks,
    loading,
    error
  };
};