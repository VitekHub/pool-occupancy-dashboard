import React from 'react';
import { useTranslation } from 'react-i18next';
import { HourlyOccupancySummary } from '@/utils/processData';
import HeatmapGrid from '@/components/shared/HeatmapGrid';
import HeatmapLegend from '@/components/shared/HeatmapLegend';
import { DAYS, HOURS } from '@/constants/time';

interface HourlyDataWithRatio extends HourlyOccupancySummary {
  ratio?: {
    current: number;
    total: number;
    fillRatio: number;
  };
}

interface BaseOccupancyHeatmapProps {
  data: HourlyDataWithRatio[];
  titleTranslationKey: string;
  tooltipTranslationKey: string;
  legendTitleTranslationKey?: string;
  loading: boolean;
  error: string | null;
  days?: string[];
}

const getColorForUtilization = (rate: number): string => {
  if (rate === 0) return 'bg-gray-100';
  if (rate < 25) return 'bg-green-100';
  if (rate < 33) return 'bg-green-300';
  if (rate < 42) return 'bg-yellow-300';
  if (rate < 52) return 'bg-orange-400';
  return 'bg-red-500';
};

const BaseOccupancyHeatmap: React.FC<BaseOccupancyHeatmapProps> = ({
  data,
  titleTranslationKey,
  tooltipTranslationKey,
  legendTitleTranslationKey = 'heatmaps:occupancy.legend.title',
  loading,
  error,
  days = DAYS
}) => {
  const { t } = useTranslation(['heatmaps', 'common']);

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common:loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{t('common:error', { message: error })}</div>;
  }

  const LEGEND_ITEMS = [
    { color: 'bg-gray-100 border border-gray-300', label: t('heatmaps:occupancy.legend.labels.empty') },
    { color: 'bg-green-100', label: t('heatmaps:occupancy.legend.labels.veryLow') },
    { color: 'bg-green-300', label: t('heatmaps:occupancy.legend.labels.low') },
    { color: 'bg-yellow-300', label: t('heatmaps:occupancy.legend.labels.medium') },
    { color: 'bg-orange-400', label: t('heatmaps:occupancy.legend.labels.high') },
    { color: 'bg-red-500', label: t('heatmaps:occupancy.legend.labels.veryHigh') }
  ];

  // Create a map for quick lookup of utilization rates
  const utilizationMap: Record<string, Record<number, number>> = {};
  const ratioMap: Record<string, Record<number, HourlyDataWithRatio['ratio']>> = {};
  
  // Initialize with empty data
  days.forEach(day => {
    utilizationMap[day] = {};
    ratioMap[day] = {};
    HOURS.forEach(hour => {
      utilizationMap[day][hour] = 0;
      ratioMap[day][hour] = undefined;
    });
  });
  
  // Fill in the data we have
  data.forEach(item => {
    if (utilizationMap[item.day] && HOURS.includes(item.hour)) {
      utilizationMap[item.day][item.hour] = item.utilizationRate;
      ratioMap[item.day][item.hour] = item.ratio;
    }
  });
  
  const getCellData = (day: string, hour: number) => {
    const utilization = utilizationMap[day][hour];
    const ratio = ratioMap[day][hour];
    
    return {
      color: getColorForUtilization(utilization),
      displayText: utilization > 0 ? `${utilization}%` : '',
      title: t(tooltipTranslationKey, {
        day: t(`common:days.${day.toLowerCase()}`),
        hour,
        utilization
      }),
      ...(ratio && {
        extraRow: {
          text: `${ratio.current}/${ratio.total}`,
          fillRatio: ratio.fillRatio
        }
      })
    };
  };

  // Check if any data point has a ratio property
  const hasRatioData = data.some(item => item.ratio !== undefined);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <HeatmapGrid
        days={days}
        hours={HOURS}
        getCellData={getCellData}
        hasExtraRow={hasRatioData}
      />
      
      <HeatmapLegend
        title={t(legendTitleTranslationKey)}
        items={LEGEND_ITEMS}
      />
    </div>
  );
};

export default BaseOccupancyHeatmap;