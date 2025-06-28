import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDataPipeline } from '@/contexts/DataPipelineContext';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { DAYS } from '@/constants/time';

const OverallOccupancyHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { pipeline, loading, error } = useDataPipeline();

  // Create labels that show "average" for all days
  const dayLabels = DAYS.reduce((labels, day) => {
    labels[day] = `(${t('heatmaps:overall.averageLabel')})`;
    return labels;
  }, {} as Record<string, string>);

  const tooltipTemplate = (day: string, hour: number, utilization: number) =>
    t('heatmaps:overall.tooltip', { day: t(`common:days.${day.toLowerCase()}`), hour, utilization });

  const heatmapData = pipeline?.getOverallHeatmapData(tooltipTemplate);

  return (
    <BaseOccupancyHeatmap
      heatmapData={heatmapData!}
      legendTitleTranslationKey="heatmaps:common.legend.title"
      loading={loading}
      error={error?.message || null}
      dayLabels={dayLabels}
    />
  );
};

export default OverallOccupancyHeatmap;