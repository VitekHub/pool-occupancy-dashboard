import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolData } from '@/utils/processData';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';

interface OccupancyHeatmapProps {
  selectedWeekId: string;
}

const getColorForUtilization = (rate: number): string => {
  if (rate === 0) return 'bg-gray-100';
  if (rate < 25) return 'bg-green-100';
  if (rate < 33) return 'bg-green-300';
  if (rate < 42) return 'bg-yellow-300';
  if (rate < 52) return 'bg-orange-400';
  return 'bg-red-500';
};

const OccupancyHeatmap: React.FC<OccupancyHeatmapProps> = ({ selectedWeekId }) => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { hourlySummary, loading, error } = usePoolData(selectedWeekId);

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{t('common:error', { message: error })}</div>;
  }

  const LEGEND_ITEMS = [
    { color: 'bg-gray-100 border border-gray-300', label: t('heatmaps:occupancy.legend.labels.empty') },
    { color: 'bg-green-100', label: t('heatmaps:occupancy.legend.labels.veryLow') },
    { color: 'bg-green-300', label: t('heatmaps:occupancy.legend.labels.low') },
    { color: 'bg-yellow-300', label: t('heatmaps:occupancy.legend.labels.medium') },
    { color: 'bg-orange-400', label: t('heatmaps:occupancy.legend.labels.high') },
    { color: 'bg-red-500', label: t('heatmaps:occupancy.legend.labels.veryHigh') }
  ];

  // Create a map for quick lookup of utilization rates
  const utilizationMap: Record<string, Record<number, number>> = {};
  
  // Initialize with empty data
  DAYS.forEach(day => {
    utilizationMap[day] = {};
    HOURS.forEach(hour => {
      utilizationMap[day][hour] = 0;
    });
  });
  
  // Fill in the data we have
  hourlySummary.forEach(item => {
    if (utilizationMap[item.day] && HOURS.includes(item.hour)) {
      utilizationMap[item.day][item.hour] = item.utilizationRate;
    }
  });
  
  const getCellData = (day: string, hour: number) => {
    const utilization = utilizationMap[day][hour];
    return {
      color: getColorForUtilization(utilization),
      displayText: utilization > 0 ? `${utilization}%` : '',
      title: t('heatmaps:occupancy.tooltip', {
        day: t(`common:days.${day.toLowerCase()}`),
        hour,
        utilization
      })
    };
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{t('heatmaps:occupancy.title')}</h2>
      
      <HeatmapGrid
        days={DAYS}
        hours={HOURS}
        getCellData={getCellData}
      />
      
      <HeatmapLegend
        title={t('heatmaps:occupancy.legend.title')}
        items={LEGEND_ITEMS}
      />
    </div>
  );
};

export default OccupancyHeatmap;