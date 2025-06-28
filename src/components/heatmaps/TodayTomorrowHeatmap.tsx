import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TodayTomorrowHeatmapGrid from '@/components/shared/TodayTomorrowHeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { useDataPipeline } from '@/contexts/DataPipelineContext';
import { format } from 'date-fns';
import { DAYS, HOURS } from '@/constants/time';
import { getDayLabels } from '@/utils/date/dateUtils';
import Toggle from '@/components/ui/Toggle';
import { usePoolSelector } from '@/contexts/PoolSelectorContext';
import { UTILIZATION_COLORS } from '@/constants/colors';
import { UTILIZATION_THRESHOLDS } from '@/constants/pool';

const TodayTomorrowHeatmap: React.FC = () => {
  const { t } = useTranslation(['heatmaps', 'common']);
  const {
    pipeline,
    loading,
    error
  } = useDataPipeline();
  const { heatmapHighThreshold } = usePoolSelector();
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);

  // Get today's day name
  const today = new Date();
  const todayName = format(today, 'EEEE');

  // Get days in circular order starting from today
  const todayIndex = DAYS.indexOf(todayName);
  const orderedDays = [
    todayName,
    ...DAYS.slice(todayIndex + 1),
    ...DAYS.slice(0, todayIndex)
  ];

  // Get day labels starting from today
  const dayLabels = getDayLabels(today, orderedDays);

  // Get the days to display
  const displayDays = showFullWeek
    ? orderedDays
    : orderedDays.slice(0, 2);

  const showMoreButton = displayDays.length > 1 && (
    <button
      onClick={() => setShowFullWeek(!showFullWeek)}
      className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
    >
      {showFullWeek ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      {t(showFullWeek ? 'todayTomorrow.showLess' : 'todayTomorrow.showMore')}
    </button>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error?.message) {
    return <div className="text-red-500">{t('common:error', { message: error.message })}</div>;
  }

  const tooltipTemplate = (day: string, hour: number, utilization: number) =>
    t('heatmaps:todayTomorrow.tooltip', { day: t(`common:days.${day.toLowerCase()}`), hour, utilization });

  const heatmapData = pipeline?.getOverallHeatmapData(tooltipTemplate);

  const adjustHeatmapThreshold = (threshold: number) => Math.round(heatmapHighThreshold * (threshold / 100));
  const getLegendLabel = (threshold: number) => `<${adjustHeatmapThreshold(threshold)}%`;

  const legendItems = [
    { color: `${UTILIZATION_COLORS.EMPTY} border border-gray-300`, label: '0%' },
    { color: UTILIZATION_COLORS.VERY_LOW, label: getLegendLabel(UTILIZATION_THRESHOLDS.VERY_LOW) },
    { color: UTILIZATION_COLORS.LOW, label: getLegendLabel(UTILIZATION_THRESHOLDS.LOW) },
    { color: UTILIZATION_COLORS.MEDIUM, label: getLegendLabel(UTILIZATION_THRESHOLDS.MEDIUM) },
    { color: UTILIZATION_COLORS.HIGH, label: `<${heatmapHighThreshold}%` },
    { color: UTILIZATION_COLORS.VERY_HIGH, label: `<${100}%` }
  ];

  return (
    <div>
      <Toggle
        value={showTooltips}
        setValue={setShowTooltips}
        label={t('heatmaps:todayTomorrow.showTooltips')}
      />

      {showMoreButton}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <TodayTomorrowHeatmapGrid
          days={displayDays}
          hours={HOURS}
          getCellData={(day, hour) => heatmapData?.getCellData(day, hour) || { utilization: 0, occupancy: { min: 0, max: 0, average: 0 }, capacity: 0, color: '', fillRatio: 0, tooltip: '' }}
          dayLabels={dayLabels}
          showTooltips={showTooltips}
        />
        
        <HeatmapLegend
          title={t('heatmaps:common.legend.title')}
          items={legendItems}
        />
      </div>

      {showMoreButton}
    </div>
  );
};

export default TodayTomorrowHeatmap;