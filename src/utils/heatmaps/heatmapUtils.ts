import { HourlyDataWithRatio } from '@/utils/types/poolData';
import { ProcessedHeatmapData, BaseCellData, ExtendedCellData } from '@/utils/types/heatmapTypes';
import { DAYS, HOURS } from '@/constants/time';
import { isCzechHoliday } from '@/utils/date/czechHolidays';
import { UTILIZATION_THRESHOLDS } from '@/constants/pool';
import { UTILIZATION_COLORS } from '@/constants/colors';

const isClosedHour = (hour: number, day: string, date: string | undefined): boolean => {
  // Weekend hours check
  const isWeekend = day === 'Saturday' || day === 'Sunday';
  const isEarlyHour = hour <= 7;
  const isLateHour = hour >= 21;
  
  // Holiday check
  const isHoliday = date ? isCzechHoliday(date).isHoliday : false;
  
  return (isWeekend || isHoliday) && (isEarlyHour || isLateHour);
};

type TranslationFunction = (key: string, options?: { [key: string]: string | number }) => string;

export const getLegendItems = (t: TranslationFunction) => [
  { color: `${UTILIZATION_COLORS.EMPTY} border border-gray-300`, label: t('heatmaps:common.legend.labels.empty') },
  { color: UTILIZATION_COLORS.VERY_LOW, label: t('heatmaps:common.legend.labels.veryLow') },
  { color: UTILIZATION_COLORS.LOW, label: t('heatmaps:common.legend.labels.low') },
  { color: UTILIZATION_COLORS.MEDIUM, label: t('heatmaps:common.legend.labels.medium') },
  { color: UTILIZATION_COLORS.HIGH, label: t('heatmaps:common.legend.labels.high') },
  { color: UTILIZATION_COLORS.VERY_HIGH, label: t('heatmaps:common.legend.labels.veryHigh') }
];

export const getColorForUtilization = (rate: number): string => {
  if (rate === 0) return UTILIZATION_COLORS.EMPTY;
  if (rate < UTILIZATION_THRESHOLDS.VERY_LOW) return UTILIZATION_COLORS.VERY_LOW;
  if (rate < UTILIZATION_THRESHOLDS.LOW) return UTILIZATION_COLORS.LOW;
  if (rate < UTILIZATION_THRESHOLDS.MEDIUM) return UTILIZATION_COLORS.MEDIUM;
  if (rate < UTILIZATION_THRESHOLDS.HIGH) return UTILIZATION_COLORS.HIGH;
  return UTILIZATION_COLORS.VERY_HIGH;
};

export const processHeatmapData = (
  data: HourlyDataWithRatio[],
  days: string[] = DAYS
): ProcessedHeatmapData => {
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
      if ('ratio' in item) {
        ratioMap[item.day][item.hour] = item.ratio;
      }
    }
  });

  return { utilizationMap, ratioMap };
};

export const getCellData = (
  day: string,
  hour: number,
  utilizationMap: Record<string, Record<number, number>>,
  tooltipTranslationKey: string,
  t: TranslationFunction
): BaseCellData => {
  const utilization = utilizationMap[day][hour];
  
  return {
    color: getColorForUtilization(utilization),
    displayText: utilization > 0 ? `${utilization}%` : '',
    title: t(tooltipTranslationKey, {
      day: t(`common:days.${day.toLowerCase()}`),
      hour,
      utilization
    })
  };
};

export const getTodayTomorrowCellData = (
  day: string,
  hour: number,
  utilizationMap: Record<string, Record<number, number>>,
  ratioMap: Record<string, Record<number, HourlyDataWithRatio['ratio']>>,
  data: HourlyDataWithRatio[],
  tooltipTranslationKey: string,
  t: TranslationFunction,
  dayLabels: Record<string, string>
): ExtendedCellData => {
  const utilization = utilizationMap[day][hour];
  const date = dayLabels[day];
  const ratio = isClosedHour(hour, day, date) ? undefined : ratioMap[day][hour];
  const hourData = data.find(item => item.day === day && item.hour === hour);
  const rawOccupancyColor = getColorForUtilization(hourData?.maxOccupancy || 0);
  
  let rawOccupancyDisplayText = '';
  if (hourData) {
    if (hourData.minOccupancy === hourData.maxOccupancy) {
      rawOccupancyDisplayText = hourData.minOccupancy > 0 ? `${hourData.minOccupancy}` : '';
    } else if (hourData.minOccupancy > 0 || hourData.maxOccupancy > 0) {
      rawOccupancyDisplayText = `${hourData.minOccupancy}-${hourData.maxOccupancy}`;
    }
  }
  
  return {
    color: getColorForUtilization(utilization),
    displayText: utilization > 0 ? `${utilization}%` : '',
    rawOccupancyColor,
    rawOccupancyDisplayText,
    title: t(tooltipTranslationKey, {
      day: t(`common:days.${day.toLowerCase()}`),
      hour,
      utilization
    }),
    ...(ratio && {
      openedLanes: {
        text: `${ratio.current}/${ratio.total}`,
        fillRatio: ratio.fillRatio
      }
    })
  };
};