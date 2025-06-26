import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolDataContext } from '@/contexts/PoolDataContext';
import HeatmapDataProcessor from '@/utils/heatmaps/heatmapDataProcessor';
import { getDayLabels } from '@/utils/date/dateUtils';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';

const RawHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const { hourlySummary, loading, error, selectedWeekId } = usePoolDataContext();
  const { heatmapHighThreshold } = usePoolSelector();
  const dayLabels = getDayLabels(selectedWeekId);

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error?.message) {
    return <div className="text-red-500">{t('common:error', { message: error.message })}</div>;
  }

  const heatmapDataProcessor = new HeatmapDataProcessor(
    hourlySummary,
    heatmapHighThreshold,
    'heatmaps:raw.tooltip',
    t,
    dayLabels
  );
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      
      <HeatmapGrid
        days={DAYS}
        hours={HOURS}
        getCellData={(day, hour) => heatmapDataProcessor.getRawCellData(day, hour)}
        dayLabels={dayLabels}
      />
      
      <HeatmapLegend
        title={t('heatmaps:raw.legend.title')}
        items={heatmapDataProcessor.getLegendItems()}
      />
    </div>
  );
};

export default RawHeatmap;