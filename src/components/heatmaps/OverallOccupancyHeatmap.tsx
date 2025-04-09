import React from 'react';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';

const OverallOccupancyHeatmap: React.FC = () => {
  const { overallHourlySummary, loading, error } = usePoolData();

  return (
    <BaseOccupancyHeatmap
      data={overallHourlySummary}
      titleTranslationKey="heatmaps:overall.title"
      tooltipTranslationKey="heatmaps:overall.tooltip"
      legendTitleTranslationKey="heatmaps:overall.legend.title"
      loading={loading}
      error={error}
    />
  );
};

export default OverallOccupancyHeatmap;