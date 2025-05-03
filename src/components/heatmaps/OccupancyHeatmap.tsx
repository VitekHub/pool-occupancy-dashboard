import React from 'react';
import { usePoolData } from '@/utils/hooks/usePoolDataHook';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { getDayLabels } from '@/utils/date/dateUtils';

interface OccupancyHeatmapProps {
  selectedWeekId: string;
}

const OccupancyHeatmap: React.FC<OccupancyHeatmapProps> = ({ selectedWeekId }) => {
  const { hourlySummary, loading, error } = usePoolData(selectedWeekId);
  const dayLabels = getDayLabels(selectedWeekId);

  return (
    <BaseOccupancyHeatmap
      data={hourlySummary}
      titleTranslationKey="heatmaps:occupancy.title"
      legendTitleTranslationKey="heatmaps:common.legend.title"
      loading={loading}
      error={error}
      dayLabels={dayLabels}
    />
  );
};

export default OccupancyHeatmap;