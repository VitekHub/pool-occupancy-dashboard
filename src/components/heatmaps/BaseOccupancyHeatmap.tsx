import React from 'react';
import { useTranslation } from 'react-i18next';
import type { HeatmapData } from '@/utils/data/types';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { UTILIZATION_COLORS } from '@/constants/colors';
import { UTILIZATION_THRESHOLDS } from '@/constants/pool';

interface BaseOccupancyHeatmapProps {
  heatmapData: HeatmapData;
  legendTitleTranslationKey?: string;
  loading: boolean;
  error: string | null;
  dayLabels: Record<string, string>;
  days?: string[];
  isRawData?: boolean;
}

const BaseOccupancyHeatmap: React.FC<BaseOccupancyHeatmapProps> = ({
  heatmapData,
  legendTitleTranslationKey = 'heatmaps:occupancy.legend.title',
  loading,
  error,
  dayLabels,
  days = DAYS,
  isRawData = false
}) => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { heatmapHighThreshold, uniformHeatmapBarHeight } = usePoolSelector();

  const adjustHeatmapThreshold = (threshold: number) => Math.round(heatmapHighThreshold * (threshold / 100));
  const getLegendLabel = (threshold: number) => `<${adjustHeatmapThreshold(threshold)}%`;

  const legendItems = [
    { color: `${UTILIZATION_COLORS.EMPTY} border border-gray-300`, label: '0%' },
    { color: UTILIZATION_COLORS.VERY_LOW, label: getLegendLabel(UTILIZATION_THRESHOLDS.VERY_LOW) },
    { color: UTILIZATION_COLORS.LOW, label: getLegendLabel(UTILIZATION_THRESHOLDS.LOW) },
    { color: UTILIZATION_COLORS.MEDIUM, label: getLegendLabel(UTILIZATION_THRESHOLDS.MEDIUM) },
    { color: UTILIZATION_COLORS.HIGH, label: `<${heatmapHighThreshold}%` },
    { color: UTILIZATION_COLORS.VERY_HIGH, label: `<${100}%` }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{t('common:error', { message: error })}</div>;
  }

  const getCellData = (day: string, hour: number) => {
    const data = heatmapData.getCellData(day, hour);
    const maxDayValue = isRawData ? heatmapData.maxOccupancyByDay.get(day) || 0 : heatmapData.maxUtilizationByDay.get(day) || 0;
    
    const displayText = isRawData 
      ? (data.occupancy.min === data.occupancy.max 
          ? (data.occupancy.min > 0 ? `${data.occupancy.min}` : '') 
          : `${data.occupancy.min}-${data.occupancy.max}`)
      : (data.utilization > 0 ? `${data.utilization}%` : '');

    const barHeight = data.fillRatio > 0 ? (uniformHeatmapBarHeight ? 100 : data.fillRatio * 100) : 0;

    return {
      color: data.color,
      colorFillRatio: barHeight,
      displayText,
      title: data.tooltip
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <HeatmapGrid
        days={days}
        hours={HOURS}
        getCellData={getCellData}
        dayLabels={dayLabels}
      />
      
      <HeatmapLegend
        title={t(legendTitleTranslationKey)}
        items={legendItems}
      />
    </div>
  );
};

export default BaseOccupancyHeatmap;