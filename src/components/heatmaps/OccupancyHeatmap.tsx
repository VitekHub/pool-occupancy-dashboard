import React from 'react';
import { usePoolData } from '@/utils/hooks/usePoolData';
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
      tooltipTranslationKey="heatmaps:occupancy.tooltip"
      legendTitleTranslationKey="heatmaps:common.legend.title"
      loading={loading}
      error={error?.message || null}
      dayLabels={dayLabels}
    />
  );
};

export default OccupancyHeatmap;