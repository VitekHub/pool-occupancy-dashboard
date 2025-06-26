import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TodayTomorrowHeatmapGrid from '@/components/shared/TodayTomorrowHeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { format } from 'date-fns';
import { DAYS, HOURS } from '@/constants/time';
import { getDayLabels } from '@/utils/date/dateUtils';
import type { HourlyOccupancySummaryWithLanes } from '@/utils/types/poolData';
import HeatmapDataProcessor from '@/utils/heatmaps/heatmapDataProcessor';
import Toggle from '@/components/ui/Toggle';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';

const TodayTomorrowHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const {
    overallHourlySummary,
    weekCapacityData,
    loading,
    error
  } = usePoolDataContext();
  const { selectedPool, heatmapHighThreshold } = usePoolSelector();
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);

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
  const filteredOverallHourlyData = overallHourlySummary.map(item => {
    const dayIndex = DAYS.indexOf(item.day);
    const todayIndex = DAYS.indexOf(todayName);
    const tomorrowIndex = (todayIndex + 1) % DAYS.length;
    
    // Find matching capacity data
    const capacity = weekCapacityData?.find(
      cap => 
        cap.day === item.day && 
        parseInt(cap.hour) === item.hour
    );
    
    // Create new item with lanes data
    const newItem: HourlyOccupancySummaryWithLanes = {
      ...item,
      lanes: selectedPool.insidePool && capacity ? {
        current: selectedPool.insidePool.totalLanes ? Math.round(capacity.maximumCapacity / (selectedPool.insidePool.maximumCapacity / selectedPool.insidePool.totalLanes)) : 0, 
        total: selectedPool.insidePool.totalLanes || 0,
        colorFillRatio: capacity.maximumCapacity / selectedPool.insidePool.maximumCapacity
      } : undefined
    };

    if (!showFullWeek && dayIndex !== todayIndex && dayIndex !== tomorrowIndex) {
      return null;
    }

    return newItem;
  }).filter((item): item is HourlyOccupancySummaryWithLanes => item !== null);

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

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error?.message) {
    return <div className="text-red-500">{t('common:error', { message: error.message })}</div>;
  }

  const heatmapDataProcessor = new HeatmapDataProcessor(
    filteredOverallHourlyData,
    heatmapHighThreshold,
    'heatmaps:todayTomorrow.tooltip',
    t,
    dayLabels
  );

  return (
    <div>
      <Toggle
        value={showTooltips}
        setValue={setShowTooltips}
        label={t('heatmaps:todayTomorrow.showTooltips')}
      />

      {showMoreButton}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <TodayTomorrowHeatmapGrid
          days={displayDays}
          hours={HOURS}
          getCellData={(day, hour) => heatmapDataProcessor.getTodayTomorrowCellData(day, hour)}
          dayLabels={dayLabels}
          showTooltips={showTooltips}
        />
        
        <HeatmapLegend
          title={t('heatmaps:common.legend.title')}
          items={heatmapDataProcessor.getLegendItems()}
        />
      </div>

      {showMoreButton}
    </div>
  );
};

export default TodayTomorrowHeatmap;