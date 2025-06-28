import React from 'react';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { getDayLabels } from '@/utils/date/dateUtils';

const OccupancyHeatmap: React.FC = () => {
  const { selectedWeekId } = usePoolDataContext();
  const dayLabels = getDayLabels(selectedWeekId);

  return (
    <BaseOccupancyHeatmap
      getCellData={(coolHeatmapDataProcessor, day, hour) =>
        coolHeatmapDataProcessor.getCellData(selectedWeekId, day, hour)
      }
      tooltipTranslationKey="heatmaps:occupancy.tooltip"
      legendTitleTranslationKey="heatmaps:common.legend.title"
      dayLabels={dayLabels}
    />
  );
};

export default OccupancyHeatmap;