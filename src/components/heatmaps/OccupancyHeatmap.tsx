import React from 'react';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';

interface OccupancyHeatmapProps {
  selectedWeekId: string;
}

const OccupancyHeatmap: React.FC<OccupancyHeatmapProps> = ({ selectedWeekId }) => {
  const { hourlySummary, loading, error } = usePoolData(selectedWeekId);

  return (
    <BaseOccupancyHeatmap
      data={hourlySummary}
      titleTranslationKey="heatmaps:occupancy.title"
      tooltipTranslationKey="heatmaps:occupancy.tooltip"
      loading={loading}
      error={error}
    />
  );
};

export default OccupancyHeatmap;