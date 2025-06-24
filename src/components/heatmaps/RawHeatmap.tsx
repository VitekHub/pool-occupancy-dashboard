import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { getColorForUtilization, getLegendItems } from '@/utils/heatmaps/heatmapUtils';
import { getDayLabels } from '@/utils/date/dateUtils';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';

const RawHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { hourlySummary, loading, error, selectedWeekId } = usePoolDataContext();
  const { heatmapHighThreshold } = usePoolSelector();
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
  const occupancyMap: Record<string, Record<number, { min: number; max: number, utilizationRate: number }>> = {};
  
  // Initialize with empty data
  DAYS.forEach(day => {
    occupancyMap[day] = {};
    HOURS.forEach(hour => {
      occupancyMap[day][hour] = { min: 0, max: 0, utilizationRate: 0 };
    });
  });
  
  // Fill in the data we have
  hourlySummary.forEach(item => {
    if (occupancyMap[item.day] && HOURS.includes(item.hour)) {
      occupancyMap[item.day][item.hour] = {
        min: item.minOccupancy,
        max: item.maxOccupancy,
        utilizationRate: item.utilizationRate
      };
    }
  });
  
  const getCellData = (day: string, hour: number) => {
    const range = occupancyMap[day][hour];
    const displayText = range.min === range.max ? 
      (range.min > 0 ? `${range.min}` : '') : 
      `${range.min}-${range.max}`;
    const average = (range.min + range.max) / 2;

    return {
      color: getColorForUtilization(range.utilizationRate, heatmapHighThreshold),
      colorFillRatio: range.max === maxOccupancyPerDayMap[day] ? 1 : (maxOccupancyPerDayMap[day] > 0 ? average / maxOccupancyPerDayMap[day] : 0), // Fill ratio based on max occupancy of the day
      displayText,
      title: t('heatmaps:raw.tooltip', {
        day: t(`common:days.${day.toLowerCase()}`),
        hour,
        min: range.min,
        max: range.max
      })
    };
  };
  
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
        items={getLegendItems(heatmapHighThreshold)}
      />
    </div>
  );
};

export default RawHeatmap;