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

const adjustHeatmapThreshold = (threshold: number, heatmapHighThreshold: number) => {
  return Math.round(heatmapHighThreshold * (threshold / 100))
}

const getLegendLabel = (threshold: number, heatmapHighThreshold: number) => {
  return `<${adjustHeatmapThreshold(threshold, heatmapHighThreshold )}%`
}

export const getLegendItems = (heatmapHighThreshold: number) => [
  { color: `${UTILIZATION_COLORS.EMPTY} border border-gray-300`, label: '0%' },
  { color: UTILIZATION_COLORS.VERY_LOW, label: getLegendLabel(UTILIZATION_THRESHOLDS.VERY_LOW, heatmapHighThreshold) },
  { color: UTILIZATION_COLORS.LOW, label: getLegendLabel(UTILIZATION_THRESHOLDS.LOW, heatmapHighThreshold) },
  { color: UTILIZATION_COLORS.MEDIUM, label: getLegendLabel(UTILIZATION_THRESHOLDS.MEDIUM, heatmapHighThreshold) },
  { color: UTILIZATION_COLORS.HIGH, label: `<${heatmapHighThreshold}%` },
  { color: UTILIZATION_COLORS.VERY_HIGH, label: `<${100}%` }
];

export const getColorForUtilization = (rate: number, highThreshold: number): string => {
  const veryLowThreshold = adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.VERY_LOW, highThreshold);
  const lowThreshold = adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.LOW, highThreshold);
  const mediumThreshold = adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.MEDIUM, highThreshold);

  if (rate === 0) return UTILIZATION_COLORS.EMPTY;
  if (rate < veryLowThreshold) return UTILIZATION_COLORS.VERY_LOW;
  if (rate < lowThreshold) return UTILIZATION_COLORS.LOW;
  if (rate < mediumThreshold) return UTILIZATION_COLORS.MEDIUM;
  if (rate < highThreshold) return UTILIZATION_COLORS.HIGH;
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

  const maxUtilizationPerDayMap: Record<string, number> = data.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = 0;
    }
    acc[item.day] = Math.max(acc[item.day], item.utilizationRate);
    return acc;
  }, {} as Record<string, number>);

  return { utilizationMap, ratioMap, maxUtilizationPerDayMap };
};

export const getCellData = (
  day: string,
  hour: number,
  utilizationMap: Record<string, Record<number, number>>,
  maxUtilizationPerDayMap: Record<string, number>,
  heatmapHighThreshold: number,
  tooltipTranslationKey: string,
  t: TranslationFunction
): BaseCellData => {
  const utilization = utilizationMap[day][hour];
  
  return {
    color: getColorForUtilization(utilization, heatmapHighThreshold),
    colorFillRatio: maxUtilizationPerDayMap[day] > 0 ? utilization / maxUtilizationPerDayMap[day] : 0, // Fill ratio based on max utilization of the day
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
  maxUtilizationPerDayMap: Record<string, number>,
  ratioMap: Record<string, Record<number, HourlyDataWithRatio['ratio']>>,
  data: HourlyDataWithRatio[],
  maximumPoolCapacity: number,
  heatmapHighThreshold: number,
  tooltipTranslationKey: string,
  t: TranslationFunction,
  dayLabels: Record<string, string>
): ExtendedCellData => {
  const utilization = utilizationMap[day][hour];
  const date = dayLabels[day];
  const ratio = isClosedHour(hour, day, date) ? undefined : ratioMap[day][hour];
  const hourData = data.find(item => item.day === day && item.hour === hour);
  
  // get max number out of raw data for 'maxOccupancy'
  const maxDayOccupancy = Math.max(...data.map(item => item.maxOccupancy), 0);

  let rawOccupancyDisplayText = '';
  let rawUtilizationInPercentage = 0
  let rawOccupancyColorFillRatio = 0;
  if (hourData?.date && new Date(hourData.date).toDateString() === new Date().toDateString()) {
    if (hourData.minOccupancy === hourData.maxOccupancy) {
      rawOccupancyDisplayText = hourData.minOccupancy > 0 ? `${hourData.minOccupancy}` : '';
    } else if (hourData.minOccupancy > 0 || hourData.maxOccupancy > 0) {
      rawOccupancyDisplayText = `${hourData.minOccupancy}-${hourData.maxOccupancy}`;
    }
    const average = (hourData.minOccupancy + hourData.maxOccupancy) / 2;
    rawUtilizationInPercentage = maximumPoolCapacity ? (average / maximumPoolCapacity) * 100 : 0;
    rawOccupancyColorFillRatio = hourData.maxOccupancy === maxDayOccupancy ? 1 : average / maxDayOccupancy; // Fill ratio based on max raw utilization of the day
  }
  
  return {
    color: getColorForUtilization(utilization, heatmapHighThreshold),
    colorFillRatio: maxUtilizationPerDayMap[day] > 0 ? utilization / maxUtilizationPerDayMap[day] : 0, // Fill ratio based on max historical utilization of the day
    displayText: utilization > 0 ? `${utilization}%` : '',
    rawOccupancyColor: getColorForUtilization(rawUtilizationInPercentage, heatmapHighThreshold),
    rawOccupancyColorFillRatio,
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