import { useState, useEffect } from 'react';
import type { OccupancyRecord, CapacityRecord, HourlyOccupancySummary, WeekInfo } from './types/poolData';
import { getAvailableWeeks } from './date/dateUtils';
import { parseOccupancyCSV, parseCapacityCSV, getHourFromTime } from './data/csvParser';
import { processOccupancyData, processOverallOccupancyData } from './data/dataProcessing';

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