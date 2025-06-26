import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { DAYS } from '@/constants/time';

const OverallOccupancyHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { overallHourlySummary, loading, error } = usePoolDataContext();

  // Create labels that show "average" for all days
  const dayLabels = DAYS.reduce((labels, day) => {
    labels[day] = `(${t('heatmaps:overall.averageLabel')})`;
    return labels;
  }, {} as Record<string, string>);

  return (
    <BaseOccupancyHeatmap
      hourlyData={overallHourlySummary}
      tooltipTranslationKey="heatmaps:overall.tooltip"
      legendTitleTranslationKey="heatmaps:common.legend.title"
      loading={loading}
      error={error?.message || null}
      dayLabels={dayLabels}
    />
  );
};

export default OverallOccupancyHeatmap;