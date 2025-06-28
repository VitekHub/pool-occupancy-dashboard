import React from 'react';
import { useTranslation } from 'react-i18next';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';
import CoolHeatmapDataProcessor from '@/utils/heatmaps/coolHeatmapDataProcessor';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { BaseCellData } from '@/utils/types/heatmapTypes';

interface BaseOccupancyHeatmapProps {
  getCellData: (coolHeatmapDataProcessor: CoolHeatmapDataProcessor, day: string, hour: number) => BaseCellData;
  tooltipTranslationKey: string;
  legendTitleTranslationKey?: string;
  dayLabels: Record<string, string>;
  days?: string[];
}

const BaseOccupancyHeatmap: React.FC<BaseOccupancyHeatmapProps> = ({
  getCellData,
  tooltipTranslationKey,
  legendTitleTranslationKey = 'heatmaps:occupancy.legend.title',
  dayLabels,
  days = DAYS
}) => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { heatmapHighThreshold } = usePoolSelector();
  const { weeklyOccupancyMap, overallOccupancyMap, loading, error } = usePoolDataContext();

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error?.message) {
    return <div className="text-red-500">{t('common:error', { message: error.message })}</div>;
  }

  const coolHeatmapDataProcessor = new CoolHeatmapDataProcessor(
    weeklyOccupancyMap,
    overallOccupancyMap,
    heatmapHighThreshold,
    tooltipTranslationKey,
    t
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <HeatmapGrid
        days={days}
        hours={HOURS}
        getCellData={(day, hour) => getCellData(coolHeatmapDataProcessor, day, hour)}
        dayLabels={dayLabels}
      />
      
      <HeatmapLegend
        title={t(legendTitleTranslationKey)}
        items={coolHeatmapDataProcessor.getLegendItems()}
      />
    </div>
  );
};

export default BaseOccupancyHeatmap;