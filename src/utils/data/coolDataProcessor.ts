import { 
    CapacityRecord, 
    HourlyOccupancySummaryWithLanes, 
    OccupancyRecord, 
    WeeklyCapacityMap, 
    WeeklyOccupancyMap,
    OverallOccupancyMap
} from '@/utils/types/poolData';
import { getWeekId } from '@/utils/date/dateUtils';
import { PoolConfig } from '@/utils/types/poolConfig';
import { isInsidePool, PoolType } from '@/utils/types/poolTypes';

interface OverallOccupancyAccumulator {
  [day: string]: {
    [hour: number]: {
      sum: number;
      count: number;
    };
  };
}

export default class CoolDataProcessor {
  constructor(
    private capacityData: CapacityRecord[],
    private occupancyData: OccupancyRecord[],
    private selectedPool: PoolConfig,
    private selectedPoolType: PoolType
  ) {}

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

  private preProcessAllCapacityData(): WeeklyCapacityMap {
    const weeklyCapacityMap: WeeklyCapacityMap = {};
    this.capacityData.forEach(record => {
      const weekId = getWeekId(record.date);
      if (!weeklyCapacityMap[weekId]) {
        weeklyCapacityMap[weekId] = {};
      }
      if (!weeklyCapacityMap[weekId][record.day]) {
        weeklyCapacityMap[weekId][record.day] = {};
      }
      weeklyCapacityMap[weekId][record.day][parseInt(record.hour)] = record.maximumCapacity;
    });
    return weeklyCapacityMap;
  }

  public preProcessAllOccupancyData(): { 
    weeklyOccupancyMap: WeeklyOccupancyMap; 
    overallOccupancyMap: OverallOccupancyMap;
  } {
    const weeklyOccupancyMap: WeeklyOccupancyMap = {};
    const overallOccupancyMap: OverallOccupancyMap = {};
    const overallOccupancyAccumulator: OverallOccupancyAccumulator = {};
    let weeklyCapacityMap: WeeklyCapacityMap = {};

    if (isInsidePool(this.selectedPoolType)) {
      weeklyCapacityMap = this.preProcessAllCapacityData();
    }

    const occupancyAccumulator = { prevHour: 0, sum: 0, count: 0 };
    this.occupancyData.forEach(occupancyRecord => {
      const { date, day, hour, occupancy: recordOccupancy } = occupancyRecord;
      const weekId = getWeekId(date);
      const hourlyMaxCapacity = this.getMaxCapacityByPoolType(weeklyCapacityMap[weekId]?.[day]?.[hour]) || 0;

      if (hour !== occupancyAccumulator.prevHour) {
        occupancyAccumulator.sum = 0;
        occupancyAccumulator.count = 0;
      }
      occupancyAccumulator.prevHour = hour;

      if (!weeklyOccupancyMap[weekId]) {
        weeklyOccupancyMap[weekId] = {};
      }
      if (!weeklyOccupancyMap[weekId][day]) {
        weeklyOccupancyMap[weekId][day] = { maxDayValues: { utilizationRate: 0, maxOccupancy: 0 } };
      }
      if (!weeklyOccupancyMap[weekId][day][hour]) {
        weeklyOccupancyMap[weekId][day][hour] = {
          date,
          day,
          hour
        } as HourlyOccupancySummaryWithLanes;
      }

      const hourlyOccupancySummary = weeklyOccupancyMap[weekId][day][hour];
      const minOccupancy = Math.min(recordOccupancy, hourlyOccupancySummary.minOccupancy || recordOccupancy);
      const maxOccupancy = Math.max(recordOccupancy, hourlyOccupancySummary.maxOccupancy || recordOccupancy);
      if (recordOccupancy > 0) {
        occupancyAccumulator.sum += recordOccupancy;
        occupancyAccumulator.count += 1;
      }

      const averageOccupancy = this.formatNumber(occupancyAccumulator.count > 0 ? occupancyAccumulator.sum / occupancyAccumulator.count : 0);
      const utilizationRate = this.formatNumber((averageOccupancy / hourlyMaxCapacity) * 100);
      const remainingCapacity = hourlyMaxCapacity - averageOccupancy;

      weeklyOccupancyMap[weekId][day][hour] = {
        ...hourlyOccupancySummary,
        minOccupancy,
        maxOccupancy,
        averageOccupancy,
        maximumCapacity: hourlyMaxCapacity,
        utilizationRate,
        remainingCapacity,
      } as HourlyOccupancySummaryWithLanes;

      const weeklyMaxDayValues = weeklyOccupancyMap[weekId][day].maxDayValues;
      weeklyMaxDayValues.utilizationRate = Math.max(weeklyMaxDayValues.utilizationRate, utilizationRate);
      weeklyMaxDayValues.maxOccupancy = Math.max(weeklyMaxDayValues.maxOccupancy, maxOccupancy);

      // skip further processing if occupancy is zero
      if (recordOccupancy > 0 && hourlyMaxCapacity > 0) {
        if (!overallOccupancyMap[day]) {
          overallOccupancyMap[day] = { maxDayValues: { averageUtilizationRate: 0 } };
          overallOccupancyAccumulator[day] = {};
        }
        if (!overallOccupancyMap[day][hour]) {
          overallOccupancyMap[day][hour] = { averageUtilizationRate: 0 };
          overallOccupancyAccumulator[day][hour] = { sum: 0, count: 0 };
        }

        const recordUtilizationRate = recordOccupancy / hourlyMaxCapacity;
        const hourlyOverallOccupancy = overallOccupancyMap[day][hour];
        const hourlyOverallOccupancyAcc = overallOccupancyAccumulator[day][hour];
        hourlyOverallOccupancyAcc.sum += recordUtilizationRate;
        hourlyOverallOccupancyAcc.count += 1;
        hourlyOverallOccupancy.averageUtilizationRate = this.formatNumber((hourlyOverallOccupancyAcc.sum / hourlyOverallOccupancyAcc.count) * 100);

        const overallMaxDayValues = overallOccupancyMap[day].maxDayValues;
        overallMaxDayValues.averageUtilizationRate = Math.max(overallMaxDayValues.averageUtilizationRate, hourlyOverallOccupancy.averageUtilizationRate);
      }
    });

    return { weeklyOccupancyMap, overallOccupancyMap };
  }
}