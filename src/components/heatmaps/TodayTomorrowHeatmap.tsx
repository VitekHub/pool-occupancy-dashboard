import React, { useState, useEffect } from 'react';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { format, addDays } from 'date-fns';
import { DAYS, getValidHours } from '@/constants/time';
import { parseCapacityCSV } from '@/utils/data/csvParser';
import type { CapacityRecord } from '@/utils/types/poolData';

const TodayTomorrowHeatmap: React.FC = () => {
  const { overallHourlySummary, capacityData, loading, error } = usePoolData();
  const [weekCapacityData, setWeekCapacityData] = useState<CapacityRecord[]>([]);
  const [weekCapacityError, setWeekCapacityError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeekCapacity = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_WEEK_CAPACITY_CSV_URL);
        if (!response.ok) {
          throw new Error('Failed to load week capacity data');
        }
        const text = await response.text();
        const parsedData = parseCapacityCSV(text);
        setWeekCapacityData(parsedData);
      } catch (err) {
        setWeekCapacityError('Failed to load week capacity data');
        console.error('Error loading week capacity data:', err);
      }
    };

    fetchWeekCapacity();
  }, []);
  
  // Get today's day name
  const today = new Date();
  const todayName = format(today, 'EEEE');
  const tomorrowName = format(addDays(today, 1), 'EEEE');
  
  // Calculate lanes from maximum occupancy
  const calculateLanes = (maxOccupancy: number): number => {
    return Math.round(maxOccupancy / 22.5); // 135 max = 6 lanes, so one lane is 22.5
  };
  
  // Filter data for today and tomorrow only
  const filteredData = overallHourlySummary.filter(item => {
    if (item.day === todayName) return true;
    if (item.day === tomorrowName && DAYS.indexOf(todayName) !== DAYS.length - 1) return true;
    return false;
  });
  
  // Add ratio data
  const dataWithRatios = filteredData.map(item => {
    // Get the current week's capacity for this time slot
    const weekCapacity = weekCapacityData.find(
      cap => cap.day === item.day && parseInt(cap.hour) === item.hour
    )?.maximumOccupancy || 135;
    
    // Calculate current number of lanes based on week capacity
    const currentLanes = calculateLanes(weekCapacity);
    
    // Total lanes is always 6
    const totalLanes = 6;
    
    // Calculate fill ratio (current/total)
    const fillRatio = currentLanes / totalLanes;
    
    // Show ratio for all hours of today and tomorrow
    const showRatio = 
      item.day === todayName || item.day === tomorrowName;
    
    return {
      ...item,
      ratio: showRatio && !weekCapacityError ? {
        current: currentLanes,
        total: totalLanes,
        fillRatio
      } : undefined
    };
  });

  return (
    <BaseOccupancyHeatmap
      data={dataWithRatios}
      titleTranslationKey="heatmaps:todayTomorrow.title"
      tooltipTranslationKey="heatmaps:todayTomorrow.tooltip"
      legendTitleTranslationKey="heatmaps:todayTomorrow.legend.title"
      loading={loading || weekCapacityData.length === 0}
      error={error}
      days={[todayName, ...(DAYS.indexOf(todayName) !== DAYS.length - 1 ? [tomorrowName] : [])]}
    />
  );
};

export default TodayTomorrowHeatmap;