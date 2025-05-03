import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TodayTomorrowHeatmapGrid from '@/components/shared/TodayTomorrowHeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import { format, addDays } from 'date-fns';
import { DAYS, HOURS } from '@/constants/time';
import { getDayLabels } from '@/utils/date/dateUtils';
import { processHeatmapData, getTodayTomorrowCellData, getLegendItems } from '@/utils/heatmaps/heatmapUtils';

const TodayTomorrowHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
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
  const orderedDays = [
    todayName,
    ...DAYS.slice(todayIndex + 1),
    ...DAYS.slice(0, todayIndex)
  ];

  // Get day labels starting from today
  const dayLabels = getDayLabels(today, orderedDays);

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
    ? orderedDays
    : orderedDays.slice(0, 2);

  const showMoreButton = displayDays.length > 1 && (
    <button
      onClick={() => setShowFullWeek(!showFullWeek)}
      className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
    >
      {showFullWeek ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      {t(showFullWeek ? 'todayTomorrow.showLess' : 'todayTomorrow.showMore')}
    </button>
  );

  if (loading || weekCapacityData.length === 0) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{t('common:error', { message: error })}</div>;
  }

  const { utilizationMap, ratioMap } = processHeatmapData(validDataWithRatios, displayDays);
  
  const getCellDataWithTranslation = (day: string, hour: number) => 
    getTodayTomorrowCellData(
      day, 
      hour, 
      utilizationMap, 
      ratioMap, 
      validDataWithRatios,
      'heatmaps:todayTomorrow.tooltip',
      t,
      dayLabels
    );

  return (
    <div>
      {showMoreButton}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <TodayTomorrowHeatmapGrid
          days={displayDays}
          hours={HOURS}
          getCellData={getCellDataWithTranslation}
          dayLabels={dayLabels}
        />
        
        <HeatmapLegend
          title={t('heatmaps:todayTomorrow.legend.title')}
          items={getLegendItems(t)}
        />
      </div>

      {showMoreButton}
    </div>
  );
};

export default TodayTomorrowHeatmap;