import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { DAYS } from '@/constants/time';

const OverallOccupancyHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { overallHourlySummary, loading, error } = usePoolData();

  // Create labels that show "average" for all days
  const dayLabels = DAYS.reduce((labels, day) => {
    labels[day] = `(${t('heatmaps:overall.averageLabel')})`;
    return labels;
  }, {} as Record<string, string>);

  return (
    <BaseOccupancyHeatmap
      data={overallHourlySummary}
      titleTranslationKey="heatmaps:overall.title"
      tooltipTranslationKey="heatmaps:overall.tooltip"
      legendTitleTranslationKey="heatmaps:common.legend.title"
      loading={loading}
      error={error}
      dayLabels={dayLabels}
    />
  );
};

export default OverallOccupancyHeatmap;