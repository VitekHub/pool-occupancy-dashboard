import { CapacityRecord, HourlyOccupancySummaryWithLanes, OccupancyRecord } from '@/utils/types/poolData';
import { BaseCellData } from '@/utils/types/heatmapTypes';
import { UTILIZATION_COLORS } from '@/constants/colors';
import { UTILIZATION_THRESHOLDS } from '@/constants/pool';
import { getWeekId } from '@/utils/date/dateUtils';
import { PoolConfig } from '@/utils/types/poolConfig';
import { isInsidePool, PoolType } from '@/utils/types/poolTypes';

type TranslationFunction = (key: string, options?: { [key: string]: string | number }) => string;

export default class CoolDataProcessor {
  private weeklyCapacityMap: Record<string, Record<string, Record<number, number>>> = {};
  private weeklyOccupancyMap: Record<string, Record<string, Record<number, HourlyOccupancySummaryWithLanes>>> = {};
  private weeklyMaxValuesPerDayMap: Record<string, Record<string, { utilizationRate: number; maxOccupancy: number }>> = {};
  private selectedPool: PoolConfig;
  private selectedPoolType: PoolType;
  private tooltipTranslationKey: string;
  private t: TranslationFunction;
  private heatmapHighThreshold: number;

  constructor(
    occupancyData: OccupancyRecord[],
    capacityData: CapacityRecord[],
    selectedPool: PoolConfig,
    selectedPoolType: PoolType,
    heatmapHighThreshold: number,
    tooltipTranslationKey: string,
    t: TranslationFunction,
  ) {
    this.selectedPool = selectedPool;
    this.selectedPoolType = selectedPoolType;
    this.heatmapHighThreshold = heatmapHighThreshold;
    this.tooltipTranslationKey = tooltipTranslationKey;
    this.t = t;
    if (isInsidePool(this.selectedPoolType)) {
      this.preProcessAllCapacityData(capacityData);
    }
    this.preProcessAllOccupancyData(occupancyData);
  }

  private formatNumber(value: number) : number {
    if (value < 1) {
      return Number(value.toFixed(1));
    }
    return Math.round(value);
  }

  private getMaxCapacityByPoolType(hourlyMaxCapacity: number | undefined): number {
    return isInsidePool(this.selectedPoolType) 
      ? hourlyMaxCapacity || this.selectedPool.insidePool?.maximumCapacity || 0 
      : this.selectedPool.outsidePool?.maximumCapacity || 0;
  }

  private preProcessAllCapacityData(capacityData: CapacityRecord[]) {
    capacityData.forEach(record => {
      const weekId = getWeekId(record.date);
      if (!this.weeklyCapacityMap[weekId]) {
        this.weeklyCapacityMap[weekId] = {};
      }
      if (!this.weeklyCapacityMap[weekId][record.day]) {
        this.weeklyCapacityMap[weekId][record.day] = {};
      }
      this.weeklyCapacityMap[weekId][record.day][parseInt(record.hour)] = record.maximumCapacity;
    });
  }

   private preProcessAllOccupancyData(occupancyData: OccupancyRecord[]) {
    occupancyData.forEach(occupancyRecord => {
      const { date, day, hour, occupancy } = occupancyRecord;
      const weekId = getWeekId(date);
      const maximumCapacity = this.getMaxCapacityByPoolType(this.weeklyCapacityMap[weekId]?.[day]?.[hour]) || 0;
      if (!this.weeklyOccupancyMap[weekId]) {
        this.weeklyOccupancyMap[weekId] = {};
        this.weeklyMaxValuesPerDayMap[weekId] = {};
      }
      if (!this.weeklyOccupancyMap[weekId][day]) {
        this.weeklyOccupancyMap[weekId][day] = {};
        this.weeklyMaxValuesPerDayMap[weekId][day] = { utilizationRate: 0, maxOccupancy: 0 };
      }
      if (!this.weeklyOccupancyMap[weekId][day][hour]) {
        this.weeklyOccupancyMap[weekId][day][hour] = {
          date,
          day,
          hour
        } as HourlyOccupancySummaryWithLanes;
      }

      const hourlyOccupancySummary = this.weeklyOccupancyMap[weekId][day][hour];
      const minOccupancy = Math.min(occupancy, hourlyOccupancySummary.minOccupancy || occupancy);
      const maxOccupancy = Math.max(occupancy, hourlyOccupancySummary.maxOccupancy || occupancy);
      const averageOccupancy = this.formatNumber((minOccupancy + maxOccupancy) / 2);
      const utilizationRate = this.formatNumber((averageOccupancy / maximumCapacity) * 100);
      const remainingCapacity = maximumCapacity - averageOccupancy;
      
      this.weeklyOccupancyMap[weekId][day][hour] = {
        ...hourlyOccupancySummary,
        minOccupancy,
        maxOccupancy,
        averageOccupancy,
        maximumCapacity,
        utilizationRate,
        remainingCapacity,
      } as HourlyOccupancySummaryWithLanes;

      const weeklyMaxValues = this.weeklyMaxValuesPerDayMap[weekId][day];
      weeklyMaxValues.utilizationRate = Math.max(weeklyMaxValues.utilizationRate, utilizationRate);
      weeklyMaxValues.maxOccupancy = Math.max(weeklyMaxValues.maxOccupancy, maxOccupancy);
    });
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

  public getCellData(selectedWeekId: string, day: string, hour: number): BaseCellData {
    const utilizationRate = this.weeklyOccupancyMap[selectedWeekId]?.[day]?.[hour]?.utilizationRate || 0;
    const maxDayUtilizationRate = this.weeklyMaxValuesPerDayMap[selectedWeekId]?.[day]?.utilizationRate || 0;
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
}