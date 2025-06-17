import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TodayTomorrowHeatmapGrid from '@/components/shared/TodayTomorrowHeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { format } from 'date-fns';
import { DAYS, HOURS } from '@/constants/time';
import { getDayLabels } from '@/utils/date/dateUtils';
import type { HourlyDataWithRatio } from '@/utils/types/poolData';
import { processHeatmapData, getTodayTomorrowCellData, getLegendItems } from '@/utils/heatmaps/heatmapUtils';
import { INSIDE_MAX_CAPACITY, INSIDE_TOTAL_LANES } from '@/constants/pool';
import FloatingTooltipToggle from '../ui/FloatingTooltipToggle';

const TodayTomorrowHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const {
    overallHourlySummary,
    weekCapacityData,
    loading,
    error
  } = usePoolDataContext();
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
  const filteredData = overallHourlySummary.map(item => {
    const dayIndex = DAYS.indexOf(item.day);
    const todayIndex = DAYS.indexOf(todayName);
    const tomorrowIndex = (todayIndex + 1) % DAYS.length;
    
    // Find matching capacity data
    const capacity = weekCapacityData?.find(
      cap => 
        cap.day === item.day && 
        parseInt(cap.hour) === item.hour
    );
    
    // Create new item with ratio data
    const newItem: HourlyDataWithRatio = {
      ...item,
      ratio: capacity ? {
        current: Math.round(capacity.maximumCapacity / (INSIDE_MAX_CAPACITY / INSIDE_TOTAL_LANES)),
        total: INSIDE_TOTAL_LANES,
        fillRatio: capacity.maximumCapacity / INSIDE_MAX_CAPACITY
      } : undefined
    };

    if (!showFullWeek && dayIndex !== todayIndex && dayIndex !== tomorrowIndex) {
      return null;
    }

    return newItem;
  }).filter((item): item is HourlyDataWithRatio => item !== null);

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

  const { utilizationMap, ratioMap } = processHeatmapData(filteredData, displayDays);
  
  const getCellDataWithTranslation = (day: string, hour: number) => 
    getTodayTomorrowCellData(
      day, 
      hour, 
      utilizationMap, 
      ratioMap, 
      filteredData,
      'heatmaps:todayTomorrow.tooltip',
      t,
      dayLabels
    );

  return (
    <div>
      <FloatingTooltipToggle
        showTooltips={showTooltips}
        setShowTooltips={setShowTooltips}
      />

      {showMoreButton}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <TodayTomorrowHeatmapGrid
          days={displayDays}
          hours={HOURS}
          getCellData={getCellDataWithTranslation}
          dayLabels={dayLabels}
          showTooltips={showTooltips}
        />
        
        <HeatmapLegend
          title={t('heatmaps:common.legend.title')}
          items={getLegendItems(t)}
        />
      </div>

      {showMoreButton}
    </div>
  );
};

export default TodayTomorrowHeatmap;