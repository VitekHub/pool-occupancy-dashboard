import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDataPipeline } from '@/contexts/DataPipelineContext';
import BaseOccupancyHeatmap from './BaseOccupancyHeatmap';
import { getDayLabels } from '@/utils/date/dateUtils';

const OccupancyHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps']);
  const { pipeline, loading, error, selectedWeekId } = useDataPipeline();
  const dayLabels = getDayLabels(selectedWeekId);

  const tooltipTemplate = (day: string, hour: number, utilization: number) =>
    t('heatmaps:occupancy.tooltip', { day: t(`common:days.${day.toLowerCase()}`), hour, utilization });

  const heatmapData = pipeline?.getHeatmapData(selectedWeekId, tooltipTemplate);

  return (
    <BaseOccupancyHeatmap
      heatmapData={heatmapData!}
      legendTitleTranslationKey="heatmaps:common.legend.title"
      loading={loading}
      error={error?.message || null}
      dayLabels={dayLabels}
    />
  );
};

export default OccupancyHeatmap;