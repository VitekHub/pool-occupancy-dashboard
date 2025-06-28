import React from 'react';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import { getDayLabels } from '@/utils/date/dateUtils';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';

const RawHeatmap: React.FC = () => {
  const { selectedWeekId } = usePoolDataContext();
  const dayLabels = getDayLabels(selectedWeekId);

  return (
    <BaseOccupancyHeatmap
      getCellData={(coolHeatmapDataProcessor, day, hour) =>
        coolHeatmapDataProcessor.getRawCellData(selectedWeekId, day, hour)
      }
      tooltipTranslationKey="heatmaps:raw.tooltip"
      legendTitleTranslationKey="heatmaps:raw.legend.title"
      dayLabels={dayLabels}
    />
  );
};

export default RawHeatmap;