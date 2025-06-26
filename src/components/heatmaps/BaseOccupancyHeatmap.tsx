import React from 'react';
import { useTranslation } from 'react-i18next';
import type { HourlyOccupancySummaryWithLanes } from '@/utils/types/poolData';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';
import HeatmapDataProcessor from '@/utils/heatmaps/heatmapDataProcessor';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';

interface BaseOccupancyHeatmapProps {
  hourlyData: HourlyOccupancySummaryWithLanes[];
  tooltipTranslationKey: string;
  legendTitleTranslationKey?: string;
  loading: boolean;
  error: string | null;
  dayLabels: Record<string, string>;
  days?: string[];
}

const BaseOccupancyHeatmap: React.FC<BaseOccupancyHeatmapProps> = ({
  hourlyData,
  tooltipTranslationKey,
  legendTitleTranslationKey = 'heatmaps:occupancy.legend.title',
  loading,
  error,
  dayLabels,
  days = DAYS
}) => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { heatmapHighThreshold } = usePoolSelector();

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{t('common:error', { message: error })}</div>;
  }

  const heatmapDataProcessor = new HeatmapDataProcessor(
    hourlyData,
    heatmapHighThreshold,
    tooltipTranslationKey,
    t,
    dayLabels
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <HeatmapGrid
        days={days}
        hours={HOURS}
        getCellData={(day, hour) => heatmapDataProcessor.getCellData(day, hour)}
        dayLabels={dayLabels}
      />
      
      <HeatmapLegend
        title={t(legendTitleTranslationKey)}
        items={heatmapDataProcessor.getLegendItems()}
      />
    </div>
  );
};

export default BaseOccupancyHeatmap;