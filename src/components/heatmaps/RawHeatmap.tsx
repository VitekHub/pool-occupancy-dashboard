import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDataPipeline } from '@/contexts/DataPipelineContext';
import { getDayLabels } from '@/utils/date/dateUtils';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';

const RawHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { pipeline, loading, error, selectedWeekId } = useDataPipeline();
  const dayLabels = getDayLabels(selectedWeekId);

  const tooltipTemplate = (day: string, hour: number, utilization: number) =>
    t('heatmaps:raw.tooltip', { 
      day: t(`common:days.${day.toLowerCase()}`), 
      hour, 
      min: utilization, // For raw data, we'll need to pass actual occupancy values
      max: utilization 
    });

  const heatmapData = pipeline?.getHeatmapData(selectedWeekId, tooltipTemplate);

  return (
    <BaseOccupancyHeatmap
      heatmapData={heatmapData!}
      legendTitleTranslationKey="heatmaps:raw.legend.title"
      loading={loading}
      error={error?.message || null}
      dayLabels={dayLabels}
      isRawData={true}
    />
  );
};

export default RawHeatmap;