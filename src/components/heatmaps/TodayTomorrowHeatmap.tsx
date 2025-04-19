import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { format, addDays } from 'date-fns';
import { DAYS } from '@/constants/time';

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
    const capacityRecord = weekCapacityData.find(
      cap => cap.day === item.day && parseInt(cap.hour) === item.hour
    );

    // If no capacity record exists for this hour, skip this time slot
    if (!capacityRecord) {
      return null;
    }

    const totalMaxOccupancy = 135;
    const totalLanes = 6;

    // Calculate current number of lanes based on week capacity
    const currentLanes = Math.round(capacityRecord.maximumOccupancy / (totalMaxOccupancy / totalLanes));

    return {
      ...item,
      ratio: !weekCapacityError ? {
        current: currentLanes,
        total: totalLanes,
        fillRatio: currentLanes / totalLanes
      } : undefined
    };
  });

  // Filter out null entries (hours with no capacity data)
  const validDataWithRatios = dataWithRatios.filter(item => item !== null);

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
        data={validDataWithRatios}
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