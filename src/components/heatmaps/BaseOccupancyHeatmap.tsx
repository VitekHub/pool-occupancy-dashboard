import React from 'react';
import { useTranslation } from 'react-i18next';
import type { HourlyDataWithRatio } from '@/utils/types/poolData';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';
import { processHeatmapData, getCellData, getLegendItems } from '@/utils/heatmaps/heatmapUtils';

interface BaseOccupancyHeatmapProps {
  data: HourlyDataWithRatio[];
  titleTranslationKey: string;
  tooltipTranslationKey: string;
  legendTitleTranslationKey?: string;
  loading: boolean;
  error: string | null;
  days?: string[];
  dayLabels?: Record<string, string>;
}

const BaseOccupancyHeatmap: React.FC<BaseOccupancyHeatmapProps> = ({
  data,
  titleTranslationKey,
  tooltipTranslationKey,
  legendTitleTranslationKey = 'heatmaps:occupancy.legend.title',
  loading,
  error,
  days = DAYS,
  dayLabels
}) => {
  const { t } = useTranslation(['heatmaps', 'common']);

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{t('common:error', { message: error })}</div>;
  }

  const { utilizationMap } = processHeatmapData(data, days);
  
  const getCellDataWithTranslation = (day: string, hour: number) => 
    getCellData(day, hour, utilizationMap, tooltipTranslationKey, t);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <HeatmapGrid
        days={days}
        hours={HOURS}
        getCellData={getCellDataWithTranslation}
        dayLabels={dayLabels}
      />
      
      <HeatmapLegend
        title={t(legendTitleTranslationKey)}
        items={getLegendItems(t)}
      />
    </div>
  );
};

export default BaseOccupancyHeatmap;