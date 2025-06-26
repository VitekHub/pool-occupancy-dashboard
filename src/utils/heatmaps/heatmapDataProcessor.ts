import { HourlyOccupancySummaryWithLanes } from '@/utils/types/poolData';
import { BaseCellData, ExtendedCellData } from '@/utils/types/heatmapTypes';
import { DAYS, HOURS } from '@/constants/time';
import { isCzechHoliday } from '@/utils/date/czechHolidays';
import { UTILIZATION_THRESHOLDS } from '@/constants/pool';
import { UTILIZATION_COLORS } from '@/constants/colors';

type TranslationFunction = (key: string, options?: { [key: string]: string | number }) => string;

export default class HeatmapDataProcessor {
  private hourlyDataMap: Record<string, Record<number, HourlyOccupancySummaryWithLanes | undefined>> = {};
  private lanesMap: Record<string, Record<number, HourlyOccupancySummaryWithLanes['lanes']>> = {};
  private maxValuesPerDayMap: Record<string, { utilizationRate: number; maxOccupancy: number }> = {};
  private heatmapHighThreshold: number;
  private tooltipTranslationKey: string;
  private t: TranslationFunction;
  private dayLabels: Record<string, string>;
  private data: HourlyOccupancySummaryWithLanes[];
  private days: string[] = DAYS;
  private static readonly OPENED_LANES_COLOR = 'bg-blue-300';

  constructor(
    data: HourlyOccupancySummaryWithLanes[],
    heatmapHighThreshold: number,
    tooltipTranslationKey: string,
    t: TranslationFunction,
    dayLabels: Record<string, string>,
    days: string[] = DAYS
  ) {
    this.data = data;
    this.heatmapHighThreshold = heatmapHighThreshold;
    this.tooltipTranslationKey = tooltipTranslationKey;
    this.t = t;
    this.days = days;
    this.dayLabels = dayLabels;
    this.processHeatmapData();
  }

  public static getBarHeight(colorFillRatio: number, uniformHeatmapBarHeight: boolean) {
    return `${colorFillRatio > 0 ? (uniformHeatmapBarHeight ? 100 : colorFillRatio * 100) : 0}%`;
  }

  private isClosedHour(hour: number, day: string, date: string | undefined): boolean {
    const isWeekend = day === 'Saturday' || day === 'Sunday';
    const isEarlyHour = hour <= 7;
    const isLateHour = hour >= 21;
    const isHoliday = date ? isCzechHoliday(date).isHoliday : false;
    return (isWeekend || isHoliday) && (isEarlyHour || isLateHour);
  }

  private processHeatmapData() {
    this.days.forEach(day => {
      this.hourlyDataMap[day] = {};
      this.lanesMap[day] = {};
      HOURS.forEach(hour => {
        this.hourlyDataMap[day][hour] = undefined;
        this.lanesMap[day][hour] = undefined;
      });
    });
    this.data.forEach(item => {
      if (this.hourlyDataMap[item.day] && HOURS.includes(item.hour)) {
        this.hourlyDataMap[item.day][item.hour] = item;
        if ('lanes' in item) {
          this.lanesMap[item.day][item.hour] = item.lanes;
        }
      }
    });

    this.maxValuesPerDayMap = this.data.reduce((acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = { utilizationRate: 0, maxOccupancy: 0 };
      }
      acc[item.day].utilizationRate = Math.max(acc[item.day].utilizationRate, item.utilizationRate);
      acc[item.day].maxOccupancy = Math.max(acc[item.day].maxOccupancy, item.maxOccupancy);
      return acc;
    }, {} as Record<string, { utilizationRate: number; maxOccupancy: number }>);
  }

  private adjustHeatmapThreshold(threshold: number) {
    return Math.round(this.heatmapHighThreshold * (threshold / 100));
  }

  private getLegendLabel(threshold: number) {
    return `<${this.adjustHeatmapThreshold(threshold)}%`;
  }

  public getLegendItems(): { color: string; label: string }[] {
    return [
      { color: `${UTILIZATION_COLORS.EMPTY} border border-gray-300`, label: '0%' },
      { color: UTILIZATION_COLORS.VERY_LOW, label: this.getLegendLabel(UTILIZATION_THRESHOLDS.VERY_LOW) },
      { color: UTILIZATION_COLORS.LOW, label: this.getLegendLabel(UTILIZATION_THRESHOLDS.LOW) },
      { color: UTILIZATION_COLORS.MEDIUM, label: this.getLegendLabel(UTILIZATION_THRESHOLDS.MEDIUM) },
      { color: UTILIZATION_COLORS.HIGH, label: `<${this.heatmapHighThreshold}%` },
      { color: UTILIZATION_COLORS.VERY_HIGH, label: `<${100}%` }
    ];
  }

  public getColorForUtilization(rate: number): string {
    const veryLowThreshold = this.adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.VERY_LOW);
    const lowThreshold = this.adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.LOW);
    const mediumThreshold = this.adjustHeatmapThreshold(UTILIZATION_THRESHOLDS.MEDIUM);

    if (rate === 0) return UTILIZATION_COLORS.EMPTY;
    if (rate < veryLowThreshold) return UTILIZATION_COLORS.VERY_LOW;
    if (rate < lowThreshold) return UTILIZATION_COLORS.LOW;
    if (rate < mediumThreshold) return UTILIZATION_COLORS.MEDIUM;
    if (rate < this.heatmapHighThreshold) return UTILIZATION_COLORS.HIGH;
    return UTILIZATION_COLORS.VERY_HIGH;
  }

  public getCellData(day: string, hour: number): BaseCellData {
    const utilizationRate = this.hourlyDataMap[day][hour]?.utilizationRate || 0;
    const maxDayUtilizationRate = this.maxValuesPerDayMap[day]?.utilizationRate || 0;
    return {
      color: this.getColorForUtilization(utilizationRate),
      colorFillRatio: maxDayUtilizationRate > 0 ? utilizationRate / maxDayUtilizationRate : 0,
      displayText: utilizationRate > 0 ? `${utilizationRate}%` : '',
      title: this.t(this.tooltipTranslationKey, {
        day: this.t(`common:days.${day.toLowerCase()}`),
        hour,
        utilization: utilizationRate
      })
    };
  }
  
  public getRawCellData (day: string, hour: number): BaseCellData {
    const hourlyData = this.hourlyDataMap[day][hour];
    if (!hourlyData) {
      return {
        color: UTILIZATION_COLORS.EMPTY,
        colorFillRatio: 0,
        displayText: '',
        title: ''
      };
    }

    const displayText = hourlyData.minOccupancy === hourlyData.maxOccupancy ? 
      (hourlyData.minOccupancy > 0 ? `${hourlyData.minOccupancy}` : '') : 
      `${hourlyData.minOccupancy}-${hourlyData.maxOccupancy}`;
    const average = (hourlyData.minOccupancy + hourlyData.maxOccupancy) / 2;
    const maxDayOccupancy = this.maxValuesPerDayMap[day]?.maxOccupancy || 0;

    return {
      color: this.getColorForUtilization(hourlyData.utilizationRate),
      colorFillRatio: hourlyData.maxOccupancy === maxDayOccupancy ? 1 : (maxDayOccupancy > 0 ? average / maxDayOccupancy : 0), // Fill ratio based on max occupancy of the day
      displayText,
      title: this.t(this.tooltipTranslationKey, {
        day: this.t(`common:days.${day.toLowerCase()}`),
        hour,
        min: hourlyData.minOccupancy,
        max: hourlyData.maxOccupancy
      })
    };
  };

  public getTodayTomorrowCellData(day: string, hour: number): ExtendedCellData {
    const hourlyData = this.hourlyDataMap[day][hour];
    if (!hourlyData) {
      return {
        color: UTILIZATION_COLORS.EMPTY,
        colorFillRatio: 0,
        displayText: '',
        title: ''
      };
    }

    const averageUtilization = hourlyData.utilizationRate;
    const date = this.dayLabels ? this.dayLabels[day] : undefined;
    const lanes = this.isClosedHour(hour, day, date) ? undefined : this.lanesMap[day][hour];
    const maxUtilizationRate = this.maxValuesPerDayMap[day]?.utilizationRate || 0;
    const maxDayOccupancy = this.maxValuesPerDayMap[day]?.maxOccupancy || 0;

    let rawOccupancy;
    if (hourlyData?.date && new Date(hourlyData.date).toDateString() === new Date().toDateString()) {
      rawOccupancy = {
        displayText: '',
        color: '',
        colorFillRatio: 0
      };
      if (hourlyData.minOccupancy === hourlyData.maxOccupancy) {
        rawOccupancy.displayText = hourlyData.minOccupancy > 0 ? `${hourlyData.minOccupancy}` : '';
      } else if (hourlyData.minOccupancy > 0 || hourlyData.maxOccupancy > 0) {
        rawOccupancy.displayText = `${hourlyData.minOccupancy}-${hourlyData.maxOccupancy}`;
      }
      const average = (hourlyData.minOccupancy + hourlyData.maxOccupancy) / 2;
      rawOccupancy.color = this.getColorForUtilization(average / hourlyData.maximumCapacity * 100);
      rawOccupancy.colorFillRatio = hourlyData.maxOccupancy === maxDayOccupancy ? 1 : average / maxDayOccupancy;
    }

    return {
      color: this.getColorForUtilization(averageUtilization),
      colorFillRatio: maxUtilizationRate > 0 ? averageUtilization / maxUtilizationRate : 0,
      displayText: averageUtilization > 0 ? `${averageUtilization}%` : '',
      rawOccupancy,
      title: this.t(this.tooltipTranslationKey, {
        day: this.t(`common:days.${day.toLowerCase()}`),
        hour,
        utilization: averageUtilization
      }),
      ...(lanes && {
        openedLanes: {
          displayText: `${lanes.current}/${lanes.total}`,
          color: HeatmapDataProcessor.OPENED_LANES_COLOR,
          colorFillRatio: lanes.colorFillRatio
        }
      })
    };
  }
}