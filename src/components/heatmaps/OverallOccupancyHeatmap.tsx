import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { DAYS } from '@/constants/time';

const OverallOccupancyHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);

  // Create labels that show "average" for all days
  const dayLabels = DAYS.reduce((labels, day) => {
    labels[day] = `(${t('heatmaps:overall.averageLabel')})`;
    return labels;
  }, {} as Record<string, string>);

  return (
    <BaseOccupancyHeatmap
      getCellData={(coolHeatmapDataProcessor, day, hour) =>
        coolHeatmapDataProcessor.getOverallCellData(day, hour)
      }
      tooltipTranslationKey="heatmaps:overall.tooltip"
      legendTitleTranslationKey="heatmaps:common.legend.title"
      dayLabels={dayLabels}
    />
  );
};

export default OverallOccupancyHeatmap;