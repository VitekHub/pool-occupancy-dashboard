import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { format, addDays } from 'date-fns';
import { DAYS, getValidHours } from '@/constants/time';
import type { CapacityRecord } from '@/utils/types/poolData';

const TodayTomorrowHeatmap: React.FC = () => {
  const { t } = useTranslation('heatmaps');
  const { 
    overallHourlySummary, 
    weekCapacityData, 
    loading, 
    error,
    weekCapacityError 
  } = usePoolData();
  const [showFullWeek, setShowFullWeek] = useState(false);

  // Get today's day name
  const today = new Date();
  const todayName = format(today, 'EEEE');
  
  // Get days in circular order starting from today
  const todayIndex = DAYS.indexOf(todayName);
  const futureDays = [
    ...DAYS.slice(todayIndex + 1),
    ...DAYS.slice(0, todayIndex)
  ];

  // Create day labels with dates
  const dayLabels: Record<string, string> = {};
  let currentDate = today;
  [todayName, ...futureDays].forEach(day => {
    dayLabels[day] = format(currentDate, 'd.M.');
    currentDate = addDays(currentDate, 1);
  });
  
  // Calculate lanes from maximum occupancy
  const calculateLanes = (maxOccupancy: number): number => {
    return Math.round(maxOccupancy / 22.5); // 135 max = 6 lanes, so one lane is 22.5
  };
  
  // Filter data for today and tomorrow only
  const filteredData = overallHourlySummary.filter(item => {
    const dayIndex = DAYS.indexOf(item.day);
    const todayIndex = DAYS.indexOf(todayName);
    
    if (showFullWeek) {
      return true
    } else {
      return dayIndex === todayIndex || (dayIndex === todayIndex + 1);
    }
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
    
    return {
      ...item,
      ratio: !weekCapacityError ? {
        current: currentLanes,
        total: totalLanes,
        fillRatio
      } : undefined
    };
  });

  // Get the days to display
  const displayDays = showFullWeek 
    ? [todayName, ...futureDays]
    : [todayName, ...(futureDays.length > 0 ? [futureDays[0]] : [])];

  const showMoreButton = futureDays.length > 1 && (
    <button
      onClick={() => setShowFullWeek(!showFullWeek)}
      className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
    >
      {showFullWeek ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      {t(showFullWeek ? 'todayTomorrow.showLess' : 'todayTomorrow.showMore')}
    </button>
  );

  return (
    <div>
      {showMoreButton}
      
      <BaseOccupancyHeatmap
        data={dataWithRatios}
        titleTranslationKey="heatmaps:todayTomorrow.title"
        tooltipTranslationKey="heatmaps:todayTomorrow.tooltip"
        legendTitleTranslationKey="heatmaps:todayTomorrow.legend.title"
        loading={loading || weekCapacityData.length === 0}
        error={error}
        days={displayDays}
        dayLabels={dayLabels}
      />

      {showMoreButton}
    </div>
  );
};

export default TodayTomorrowHeatmap;