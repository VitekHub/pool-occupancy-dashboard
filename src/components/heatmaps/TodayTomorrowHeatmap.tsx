import React from 'react';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { format, addDays } from 'date-fns';
import { DAYS, getValidHours } from '@/constants/time';

const TodayTomorrowHeatmap: React.FC = () => {
  const { overallHourlySummary, capacityData, loading, error } = usePoolData();
  
  // Get today's day name
  const today = new Date();
  const todayName = format(today, 'EEEE');
  const tomorrowName = format(addDays(today, 1), 'EEEE');
  
  // Filter data for today and tomorrow only
  const filteredData = overallHourlySummary.filter(item => {
    if (item.day === todayName) return true;
    if (item.day === tomorrowName && DAYS.indexOf(todayName) !== DAYS.length - 1) return true;
    return false;
  });
  
  // Add ratio data
  const dataWithRatios = filteredData.map(item => {
    const capacity = capacityData.find(
      cap => cap.day === item.day && parseInt(cap.hour) === item.hour
    )?.maximumOccupancy || 135;
    
    // Show ratio for all hours of today and tomorrow
    const showRatio = 
      item.day === todayName || item.day === tomorrowName;
    
    return {
      ...item,
      ratio: showRatio ? {
        current: 3,
        total: 6,
        fillRatio: 3/6
      } : undefined
    };
  });

  return (
    <BaseOccupancyHeatmap
      data={dataWithRatios}
      titleTranslationKey="heatmaps:todayTomorrow.title"
      tooltipTranslationKey="heatmaps:todayTomorrow.tooltip"
      legendTitleTranslationKey="heatmaps:todayTomorrow.legend.title"
      loading={loading}
      error={error}
      days={[todayName, ...(DAYS.indexOf(todayName) !== DAYS.length - 1 ? [tomorrowName] : [])]}
    />
  );
};

export default TodayTomorrowHeatmap;