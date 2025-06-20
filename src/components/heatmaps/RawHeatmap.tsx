import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { getColorForUtilization } from '@/utils/heatmaps/heatmapUtils';
import { getDayLabels } from '@/utils/date/dateUtils';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { POOL_TYPES } from '@/utils/types/poolTypes';

const RawHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { hourlySummary, loading, error, selectedWeekId } = usePoolDataContext();
  const { selectedPool, selectedPoolType } = usePoolSelector();
  const dayLabels = getDayLabels(selectedWeekId);

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error?.message) {
    return <div className="text-red-500">{t('common:error', { message: error.message })}</div>;
  }
  
  // Create a map for maximum occupancy per day
  const maxOccupancyPerDayMap = hourlySummary.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = 0;
    }
    acc[item.day] = Math.max(acc[item.day], item.maxOccupancy);
    return acc;
  }, {} as Record<string, number>);

  // Create a map for quick lookup of average occupancy
  const occupancyMap: Record<string, Record<number, { min: number; max: number }>> = {};
  
  // Initialize with empty data
  DAYS.forEach(day => {
    occupancyMap[day] = {};
    HOURS.forEach(hour => {
      occupancyMap[day][hour] = { min: 0, max: 0 };
    });
  });
  
  // Fill in the data we have
  hourlySummary.forEach(item => {
    if (occupancyMap[item.day] && HOURS.includes(item.hour)) {
      occupancyMap[item.day][item.hour] = {
        min: item.minOccupancy,
        max: item.maxOccupancy
      };
    }
  });
  
  const getCellData = (day: string, hour: number) => {
    const range = occupancyMap[day][hour];
    const displayText = range.min === range.max ? 
      (range.min > 0 ? `${range.min}` : '') : 
      `${range.min}-${range.max}`;
    const average = (range.min + range.max) / 2;
    const maximumCapacity = selectedPoolType === POOL_TYPES.INSIDE ?  selectedPool.insidePool?.maximumCapacity : selectedPool.outsidePool?.maximumCapacity;
    const percentageUtilization = maximumCapacity ? (average / maximumCapacity) * 100 : 0;

    return {
      color: getColorForUtilization(percentageUtilization),
      colorFillRatio: range.max === maxOccupancyPerDayMap[day] ? 1 : average / maxOccupancyPerDayMap[day], // Fill ratio based on max occupancy of the day
      displayText,
      title: t('heatmaps:raw.tooltip', {
        day: t(`common:days.${day.toLowerCase()}`),
        hour,
        min: range.min,
        max: range.max
      })
    };
  };

  const LEGEND_ITEMS = [
    { color: 'bg-gray-100 border border-gray-300', label: t('heatmaps:raw.legend.labels.empty') },
    { color: 'bg-green-100', label: t('heatmaps:raw.legend.labels.veryLow') },
    { color: 'bg-green-300', label: t('heatmaps:raw.legend.labels.low') },
    { color: 'bg-yellow-300', label: t('heatmaps:raw.legend.labels.medium') },
    { color: 'bg-orange-400', label: t('heatmaps:raw.legend.labels.high') },
    { color: 'bg-red-500', label: t('heatmaps:raw.legend.labels.veryHigh') }
  ];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      
      <HeatmapGrid
        days={DAYS}
        hours={HOURS}
        getCellData={getCellData}
        dayLabels={dayLabels}
      />
      
      <HeatmapLegend
        title={t('heatmaps:raw.legend.title')}
        items={LEGEND_ITEMS}
      />
    </div>
  );
};

export default RawHeatmap;