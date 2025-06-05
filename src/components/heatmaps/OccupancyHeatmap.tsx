import React from 'react';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { getDayLabels } from '@/utils/date/dateUtils';

const OccupancyHeatmap: React.FC = () => {
  const { hourlySummary, loading, error, selectedWeekId } = usePoolDataContext();
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